import { pool } from "../db/pool.js";
import { AppError } from "../utils/AppError.js";

function mapMonitor(row) {
  const lastSeen = row.last_seen_at ? new Date(row.last_seen_at) : null;
  const recentlySeen = lastSeen && Date.now() - lastSeen.getTime() < 45_000;
  return {
    submissionId: row.id,
    examId: row.exam_id,
    status: row.status,
    answeredCount: row.answered_count || 0,
    questionCount: Array.isArray(row.questions) ? row.questions.length : 0,
    currentQuestionId: row.current_question_id,
    tabSwitches: row.tab_switches || 0,
    lastSeenAt: row.last_seen_at,
    connectionStatus: row.status === "in_progress" ? (recentlySeen ? "online" : "offline") : "submitted",
    startedAt: row.started_at,
    deadlineAt: row.deadline_at,
    submittedAt: row.submitted_at,
    student: { id: row.student_id, name: row.student_name, email: row.student_email }
  };
}

export async function recordHeartbeat(studentId, payload) {
  const submissionId = Number(payload.submissionId);
  if (!Number.isFinite(submissionId)) throw new AppError(400, "A valid submission is required.");
  const answeredCount = Math.max(0, Number(payload.answeredCount) || 0);
  const tabSwitches = Math.max(0, Number(payload.tabSwitches) || 0);
  const currentQuestionId = payload.currentQuestionId ? String(payload.currentQuestionId).slice(0, 100) : null;

  const result = await pool.query(
    `UPDATE submissions s
     SET answered_count = $1,
         current_question_id = $2,
         tab_switches = GREATEST(tab_switches, $3),
         last_seen_at = NOW(),
         connection_status = CASE WHEN s.status = 'in_progress' THEN 'online' ELSE 'submitted' END,
         updated_at = NOW()
     FROM exams e, users u
     WHERE s.id = $4 AND s.student_id = $5
       AND e.id = s.exam_id AND u.id = s.student_id
     RETURNING s.*, e.questions, e.lecturer_id, u.name AS student_name, u.email AS student_email`,
    [answeredCount, currentQuestionId, tabSwitches, submissionId, studentId]
  );
  if (!result.rowCount) throw new AppError(404, "Active submission was not found.");
  return { monitor: mapMonitor(result.rows[0]), lecturerId: result.rows[0].lecturer_id };
}

export async function markOffline(submissionId, studentId) {
  if (!submissionId) return;
  await pool.query(
    `UPDATE submissions
     SET connection_status = CASE WHEN status = 'in_progress' THEN 'offline' ELSE 'submitted' END,
         updated_at = NOW()
     WHERE id = $1 AND student_id = $2`,
    [submissionId, studentId]
  );
}

export async function listExamMonitoring(examId, teacherId) {
  const ownership = await pool.query("SELECT id FROM exams WHERE id = $1 AND lecturer_id = $2", [examId, teacherId]);
  if (!ownership.rowCount) throw new AppError(404, "Exam was not found.");
  const result = await pool.query(
    `SELECT s.*, e.questions, u.name AS student_name, u.email AS student_email
     FROM submissions s
     JOIN exams e ON e.id = s.exam_id
     JOIN users u ON u.id = s.student_id
     WHERE s.exam_id = $1
     ORDER BY s.started_at DESC`,
    [examId]
  );
  return result.rows.map(mapMonitor);
}

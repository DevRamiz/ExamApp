import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
import { AppError } from "../utils/AppError.js";
import { requireEmail, requireText } from "../utils/validation.js";
import { listAuditLogs, writeAudit } from "./auditService.js";

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    isActive: row.is_active,
    failedLoginAttempts: row.failed_login_attempts,
    lockedUntil: row.locked_until,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function systemStats() {
  const result = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM users) AS users,
       (SELECT COUNT(*)::int FROM users WHERE role = 'teacher') AS teachers,
       (SELECT COUNT(*)::int FROM users WHERE role = 'student') AS students,
       (SELECT COUNT(*)::int FROM users WHERE is_active = FALSE) AS disabled_users,
       (SELECT COUNT(*)::int FROM exams) AS exams,
       (SELECT COUNT(*)::int FROM exams WHERE status = 'published') AS published_exams,
       (SELECT COUNT(*)::int FROM submissions) AS submissions,
       (SELECT COUNT(*)::int FROM submissions WHERE status = 'in_progress') AS active_attempts,
       (SELECT COUNT(*)::int FROM notifications WHERE is_read = FALSE) AS unread_notifications,
       (SELECT COUNT(*)::int FROM audit_logs WHERE created_at > NOW() - INTERVAL '24 hours') AS audit_events_24h`
  );
  return result.rows[0];
}

export async function listUsers({ search = "", role = "" } = {}) {
  const searchValue = `%${String(search).trim().toLowerCase()}%`;
  const roleValue = ["admin", "teacher", "student"].includes(role) ? role : null;
  const result = await pool.query(
    `SELECT id, name, email, role, is_active, failed_login_attempts, locked_until, created_at, updated_at
     FROM users
     WHERE ($1::text = '%%' OR LOWER(name) LIKE $1::text OR LOWER(email) LIKE $1::text)
       AND ($2::varchar IS NULL OR role = $2::varchar)
     ORDER BY created_at DESC`,
    [searchValue, roleValue]
  );
  return result.rows.map(mapUser);
}

export async function createUser(adminId, payload, context = {}) {
  const name = requireText(payload.name, "Name", 100);
  const email = requireEmail(payload.email);
  const password = requireText(payload.password, "Password", 200);
  const role = ["admin", "teacher", "student"].includes(payload.role) ? payload.role : "student";
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new AppError(400, "Password must contain at least 8 characters, one letter, and one number.");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  let result;
  try {
    result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, is_active, failed_login_attempts, locked_until, created_at, updated_at`,
      [name, email, passwordHash, role]
    );
  } catch (error) {
    if (error.code === "23505") throw new AppError(409, "An account with this email already exists.");
    throw error;
  }
  await writeAudit({ userId: adminId, action: "admin.user_created", entityType: "user", entityId: result.rows[0].id, details: { role }, ipAddress: context.ipAddress });
  return mapUser(result.rows[0]);
}

export async function updateUser(adminId, userId, payload, context = {}) {
  if (Number(adminId) === Number(userId) && payload.isActive === false) {
    throw new AppError(409, "You cannot disable your own admin account.");
  }
  const role = ["admin", "teacher", "student"].includes(payload.role) ? payload.role : null;
  const isActive = typeof payload.isActive === "boolean" ? payload.isActive : null;
  const unlock = payload.unlock === true;
  const result = await pool.query(
    `UPDATE users
     SET role = COALESCE($1::varchar, role),
         is_active = COALESCE($2::boolean, is_active),
         failed_login_attempts = CASE WHEN $3::boolean THEN 0 ELSE failed_login_attempts END,
         locked_until = CASE WHEN $3::boolean THEN NULL ELSE locked_until END,
         updated_at = NOW()
     WHERE id = $4
     RETURNING id, name, email, role, is_active, failed_login_attempts, locked_until, created_at, updated_at`,
    [role, isActive, unlock, userId]
  );
  if (!result.rowCount) throw new AppError(404, "User was not found.");
  await writeAudit({ userId: adminId, action: "admin.user_updated", entityType: "user", entityId: userId, details: { role, isActive, unlock }, ipAddress: context.ipAddress });
  return mapUser(result.rows[0]);
}

export async function listExams() {
  const result = await pool.query(
    `SELECT e.id, e.title, e.status, e.created_at, e.updated_at, e.published_at,
            u.id AS lecturer_id, u.name AS lecturer_name, u.email AS lecturer_email,
            COUNT(s.id)::int AS submission_count
     FROM exams e JOIN users u ON u.id = e.lecturer_id
     LEFT JOIN submissions s ON s.exam_id = e.id
     GROUP BY e.id, u.id
     ORDER BY e.updated_at DESC`
  );
  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    submissionCount: row.submission_count,
    lecturer: { id: row.lecturer_id, name: row.lecturer_name, email: row.lecturer_email }
  }));
}

export async function deleteExam(adminId, examId, context = {}) {
  const result = await pool.query("DELETE FROM exams WHERE id = $1 RETURNING title", [examId]);
  if (!result.rowCount) throw new AppError(404, "Exam was not found.");
  await writeAudit({ userId: adminId, action: "admin.exam_deleted", entityType: "exam", entityId: examId, details: { title: result.rows[0].title }, ipAddress: context.ipAddress });
}

export async function resetSubmission(adminId, submissionId, context = {}) {
  const result = await pool.query(
    `UPDATE submissions
     SET status = 'in_progress', answers = '[]'::jsonb, auto_score = 0, manual_score = 0,
         final_score = NULL, feedback = '', results_published = FALSE,
         submitted_at = NULL, graded_at = NULL, answered_count = 0,
         current_question_id = NULL, tab_switches = 0, connection_status = 'offline',
         deadline_at = NOW() + (SELECT duration_minutes * INTERVAL '1 minute' FROM exams WHERE id = submissions.exam_id),
         updated_at = NOW()
     WHERE id = $1 RETURNING id`,
    [submissionId]
  );
  if (!result.rowCount) throw new AppError(404, "Submission was not found.");
  await writeAudit({ userId: adminId, action: "admin.submission_reset", entityType: "submission", entityId: submissionId, ipAddress: context.ipAddress });
  return { id: submissionId };
}

export { listAuditLogs };

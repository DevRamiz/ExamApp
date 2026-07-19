import { pool } from "../db/pool.js";

export async function teacherDashboard(teacherId) {
  const result = await pool.query(
    `SELECT
       COUNT(DISTINCT e.id)::int AS exams,
       COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'published')::int AS published_exams,
       COUNT(s.id)::int AS submissions,
       COUNT(s.id) FILTER (WHERE s.status = 'submitted')::int AS waiting_for_grade,
       ROUND(AVG(s.final_score), 2) AS average_score
     FROM exams e LEFT JOIN submissions s ON s.exam_id = e.id
     WHERE e.lecturer_id = $1`,
    [teacherId]
  );
  const row = result.rows[0];
  return {
    exams: row.exams,
    publishedExams: row.published_exams,
    submissions: row.submissions,
    waitingForGrade: row.waiting_for_grade,
    averageScore: row.average_score == null ? null : Number(row.average_score)
  };
}

export async function studentDashboard(studentId) {
  const result = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM exams WHERE status = 'published') AS available_exams,
       COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress,
       COUNT(*) FILTER (WHERE status IN ('submitted', 'graded'))::int AS completed,
       COUNT(*) FILTER (WHERE results_published = TRUE)::int AS published_results
     FROM submissions WHERE student_id = $1`,
    [studentId]
  );
  const row = result.rows[0];
  return {
    availableExams: row.available_exams,
    inProgress: row.in_progress,
    completed: row.completed,
    publishedResults: row.published_results
  };
}

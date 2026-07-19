import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import { AppError } from "../utils/AppError.js";
import { listExamSubmissions } from "./examService.js";
import { writeAudit } from "./auditService.js";

function serviceUrl(value) { return /^https?:\/\//i.test(value) ? value : `http://${value}`; }

async function reportData(examId, teacherId) {
  const examResult = await pool.query(
    `SELECT id, title, description, status, duration_minutes, questions
     FROM exams WHERE id = $1 AND lecturer_id = $2`,
    [examId, teacherId]
  );
  if (!examResult.rowCount) throw new AppError(404, "Exam was not found.");
  const row = examResult.rows[0];
  return {
    exam: { id: row.id, title: row.title, description: row.description, status: row.status, durationMinutes: row.duration_minutes, questionCount: row.questions?.length || 0 },
    submissions: await listExamSubmissions(examId, teacherId)
  };
}

export async function generateExamReport(examId, teacherId, format, context = {}) {
  const data = await reportData(examId, teacherId);
  let response;
  try {
    response = await fetch(`${serviceUrl(env.reportServiceUrl)}/${format}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(15_000)
    });
  } catch {
    throw new AppError(503, "The report microservice is unavailable.");
  }
  if (!response.ok) throw new AppError(502, "Report generation failed.");
  const content = await response.text();
  await writeAudit({ userId: teacherId, action: `report.${format}_generated`, entityType: "exam", entityId: examId, ipAddress: context.ipAddress });
  return { content, examTitle: data.exam.title };
}

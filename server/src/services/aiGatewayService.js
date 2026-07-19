import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { normalizeQuestions, requireInteger, requireText } from "../utils/validation.js";
import { getSubmission } from "./submissionService.js";
import { writeAudit } from "./auditService.js";

function serviceUrl(value) { return /^https?:\/\//i.test(value) ? value : `http://${value}`; }

async function callAi(path, payload) {
  let response;
  try {
    response = await fetch(`${serviceUrl(env.aiServiceUrl)}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20_000)
    });
  } catch {
    throw new AppError(503, "The optional AI service is unavailable. The rest of ExamFlow still works normally.");
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new AppError(502, body.error || "AI service failed.");
  return body;
}

export async function generateQuestions(teacherId, payload, context = {}) {
  const topic = requireText(payload.topic, "Topic", 200);
  const count = requireInteger(payload.count || 3, "Question count", 1, 10);
  const difficulty = ["easy", "medium", "hard"].includes(payload.difficulty) ? payload.difficulty : "medium";
  const types = Array.isArray(payload.types) ? payload.types.filter((type) => ["multiple_choice", "text"].includes(type)) : ["multiple_choice", "text"];
  const result = await callAi("/generate-questions", { topic, count, difficulty, types });
  const questions = normalizeQuestions(result.questions || []);
  await writeAudit({ userId: teacherId, action: "ai.questions_generated", entityType: "exam", details: { topic, count: questions.length, provider: result.provider }, ipAddress: context.ipAddress });
  return { questions, provider: result.provider || "external" };
}

export async function suggestFeedback(submissionId, teacher, context = {}) {
  const submission = await getSubmission(submissionId, teacher);
  const result = await callAi("/feedback-suggestion", { submission });
  const feedback = requireText(result.feedback, "Suggested feedback", 3000);
  await writeAudit({ userId: teacher.id, action: "ai.feedback_suggested", entityType: "submission", entityId: submissionId, details: { provider: result.provider }, ipAddress: context.ipAddress });
  return { feedback, provider: result.provider || "external" };
}

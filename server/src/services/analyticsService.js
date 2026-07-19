import { pool } from "../db/pool.js";
import { AppError } from "../utils/AppError.js";
import { totalExamPoints } from "./gradingService.js";

function round(value, digits = 2) {
  if (value == null || Number.isNaN(Number(value))) return null;
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
}

export async function teacherOverview(teacherId) {
  const result = await pool.query(
    `SELECT
       COUNT(DISTINCT e.id)::int AS exams,
       COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'published')::int AS published_exams,
       COUNT(s.id)::int AS attempts,
       COUNT(s.id) FILTER (WHERE s.status = 'in_progress')::int AS active_attempts,
       COUNT(s.id) FILTER (WHERE s.status = 'submitted')::int AS waiting_for_grade,
       COUNT(s.id) FILTER (WHERE s.status = 'graded')::int AS graded_attempts,
       ROUND(AVG(s.final_score) FILTER (WHERE s.results_published = TRUE), 2) AS average_score,
       MAX(s.final_score) FILTER (WHERE s.results_published = TRUE) AS highest_score,
       MIN(s.final_score) FILTER (WHERE s.results_published = TRUE) AS lowest_score
     FROM exams e
     LEFT JOIN submissions s ON s.exam_id = e.id
     WHERE e.lecturer_id = $1`,
    [teacherId]
  );
  const row = result.rows[0];
  return {
    exams: row.exams,
    publishedExams: row.published_exams,
    attempts: row.attempts,
    activeAttempts: row.active_attempts,
    waitingForGrade: row.waiting_for_grade,
    gradedAttempts: row.graded_attempts,
    averageScore: round(row.average_score),
    highestScore: round(row.highest_score),
    lowestScore: round(row.lowest_score)
  };
}

export async function examAnalytics(examId, teacherId) {
  const examResult = await pool.query(
    `SELECT e.*, u.name AS lecturer_name
     FROM exams e JOIN users u ON u.id = e.lecturer_id
     WHERE e.id = $1 AND e.lecturer_id = $2`,
    [examId, teacherId]
  );
  if (!examResult.rowCount) throw new AppError(404, "Exam was not found.");
  const exam = examResult.rows[0];
  const questions = Array.isArray(exam.questions) ? exam.questions : [];
  const submissionsResult = await pool.query(
    `SELECT s.*, u.name AS student_name, u.email AS student_email
     FROM submissions s JOIN users u ON u.id = s.student_id
     WHERE s.exam_id = $1
     ORDER BY s.started_at`,
    [examId]
  );
  const submissions = submissionsResult.rows;
  const graded = submissions.filter((item) => item.final_score != null);
  const totalPoints = totalExamPoints(questions) || 1;
  const percentages = graded.map((item) => (Number(item.final_score) / totalPoints) * 100);
  const passCount = percentages.filter((score) => score >= Number(exam.pass_score || 60)).length;

  const questionAnalytics = questions.map((question) => {
    let attempted = 0;
    let totalAwarded = 0;
    let correctCount = 0;
    for (const submission of submissions) {
      const answer = (Array.isArray(submission.answers) ? submission.answers : []).find((item) => String(item.questionId) === String(question.id));
      if (!answer || !String(answer.value || "").trim()) continue;
      attempted += 1;
      const awarded = Number(answer.automaticPoints || 0) + Number(answer.manualPoints || 0);
      totalAwarded += awarded;
      if (question.type === "multiple_choice" && awarded >= Number(question.points)) correctCount += 1;
    }
    return {
      questionId: question.id,
      text: question.text,
      type: question.type,
      points: Number(question.points),
      attempted,
      averagePoints: attempted ? round(totalAwarded / attempted) : 0,
      successRate: attempted ? round((totalAwarded / (attempted * Number(question.points || 1))) * 100) : 0,
      correctRate: question.type === "multiple_choice" && attempted ? round((correctCount / attempted) * 100) : null
    };
  });

  return {
    exam: {
      id: exam.id,
      title: exam.title,
      status: exam.status,
      passScore: Number(exam.pass_score),
      totalPoints,
      questionCount: questions.length
    },
    summary: {
      attempts: submissions.length,
      active: submissions.filter((item) => item.status === "in_progress").length,
      submitted: submissions.filter((item) => item.status === "submitted").length,
      graded: graded.length,
      averagePercentage: percentages.length ? round(percentages.reduce((a, b) => a + b, 0) / percentages.length) : null,
      highestPercentage: percentages.length ? round(Math.max(...percentages)) : null,
      lowestPercentage: percentages.length ? round(Math.min(...percentages)) : null,
      passRate: percentages.length ? round((passCount / percentages.length) * 100) : null
    },
    questions: questionAnalytics,
    students: submissions.map((item) => ({
      submissionId: item.id,
      name: item.student_name,
      email: item.student_email,
      status: item.status,
      finalScore: item.final_score == null ? null : Number(item.final_score),
      percentage: item.final_score == null ? null : round((Number(item.final_score) / totalPoints) * 100),
      submittedAt: item.submitted_at
    }))
  };
}

export async function studentAnalytics(studentId) {
  const result = await pool.query(
    `SELECT s.id, s.final_score, s.results_published, s.submitted_at, s.graded_at,
            e.id AS exam_id, e.title, e.questions, e.pass_score
     FROM submissions s JOIN exams e ON e.id = s.exam_id
     WHERE s.student_id = $1 AND s.results_published = TRUE
     ORDER BY COALESCE(s.graded_at, s.submitted_at) ASC`,
    [studentId]
  );
  const history = result.rows.map((row) => {
    const totalPoints = totalExamPoints(row.questions || []) || 1;
    const percentage = round((Number(row.final_score || 0) / totalPoints) * 100);
    return {
      submissionId: row.id,
      examId: row.exam_id,
      title: row.title,
      score: Number(row.final_score || 0),
      totalPoints,
      percentage,
      passed: percentage >= Number(row.pass_score || 60),
      date: row.graded_at || row.submitted_at
    };
  });
  const average = history.length ? round(history.reduce((sum, item) => sum + item.percentage, 0) / history.length) : null;
  return {
    completedResults: history.length,
    averagePercentage: average,
    highestPercentage: history.length ? Math.max(...history.map((item) => item.percentage)) : null,
    lowestPercentage: history.length ? Math.min(...history.map((item) => item.percentage)) : null,
    passed: history.filter((item) => item.passed).length,
    history
  };
}

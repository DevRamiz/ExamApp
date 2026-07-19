import test from "node:test";
import assert from "node:assert/strict";
import { applyManualGrades, gradeAutomaticQuestions, totalExamPoints } from "../services/gradingService.js";

const questions = [
  { id: "a", type: "multiple_choice", correctAnswer: "Yes", points: 20 },
  { id: "b", type: "text", points: 30 }
];

test("automatic grading awards points only for a correct choice", () => {
  const result = gradeAutomaticQuestions(questions, [
    { questionId: "a", value: "Yes" },
    { questionId: "b", value: "Explanation" }
  ]);
  assert.equal(result.autoScore, 20);
  assert.equal(result.answers[0].automaticPoints, 20);
  assert.equal(result.answers[1].automaticPoints, 0);
});

test("manual grading is clamped to the question maximum", () => {
  const initial = gradeAutomaticQuestions(questions, []);
  const result = applyManualGrades(questions, initial.answers, [
    { questionId: "b", points: 100, comment: "Good" }
  ]);
  assert.equal(result.manualScore, 30);
  assert.equal(result.answers[1].teacherComment, "Good");
});

test("total exam points adds all question points", () => {
  assert.equal(totalExamPoints(questions), 50);
});

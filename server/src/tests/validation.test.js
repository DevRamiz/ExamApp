import test from "node:test";
import assert from "node:assert/strict";
import { normalizeQuestions, requireEmail } from "../utils/validation.js";

test("email validation normalizes case", () => {
  assert.equal(requireEmail(" Test@Example.com "), "test@example.com");
});

test("multiple choice correct answer must match an option", () => {
  assert.throws(() => normalizeQuestions([{
    id: "q1", type: "multiple_choice", text: "Question", points: 10,
    options: ["A", "B"], correctAnswer: "C"
  }]), /must match an option/);
});

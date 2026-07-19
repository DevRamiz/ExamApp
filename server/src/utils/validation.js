import { AppError } from "./AppError.js";

export function requireText(value, field, maxLength = 500) {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(400, `${field} is required.`);
  }
  const clean = value.trim();
  if (clean.length > maxLength) {
    throw new AppError(400, `${field} is too long.`);
  }
  return clean;
}

export function requireEmail(value) {
  const email = requireText(value, "Email", 160).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError(400, "Email address is not valid.");
  }
  return email;
}

export function requireInteger(value, field, min, max) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new AppError(400, `${field} must be an integer between ${min} and ${max}.`);
  }
  return number;
}

export function normalizeQuestions(input) {
  if (!Array.isArray(input) || input.length === 0) {
    throw new AppError(400, "An exam must contain at least one question.");
  }

  return input.map((question, index) => {
    const type = question?.type;
    if (!["multiple_choice", "text"].includes(type)) {
      throw new AppError(400, `Question ${index + 1} has an invalid type.`);
    }

    const normalized = {
      id: String(question.id || `q-${Date.now()}-${index}`),
      type,
      text: requireText(question.text, `Question ${index + 1} text`, 1000),
      points: requireInteger(question.points, `Question ${index + 1} points`, 1, 1000)
    };

    if (type === "multiple_choice") {
      if (!Array.isArray(question.options) || question.options.length < 2) {
        throw new AppError(400, `Question ${index + 1} needs at least two options.`);
      }
      normalized.options = question.options.map((option, optionIndex) =>
        requireText(option, `Question ${index + 1} option ${optionIndex + 1}`, 300)
      );
      normalized.correctAnswer = requireText(
        question.correctAnswer,
        `Question ${index + 1} correct answer`,
        300
      );
      if (!normalized.options.includes(normalized.correctAnswer)) {
        throw new AppError(400, `Question ${index + 1} correct answer must match an option.`);
      }
    }

    return normalized;
  });
}

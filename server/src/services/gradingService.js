export function gradeAutomaticQuestions(questions, submittedAnswers) {
  const answersByQuestion = new Map(
    (submittedAnswers || []).map((answer) => [String(answer.questionId), answer])
  );

  let autoScore = 0;
  const answers = questions.map((question) => {
    const current = answersByQuestion.get(String(question.id)) || {};
    const value = typeof current.value === "string" ? current.value : "";
    const automaticPoints =
      question.type === "multiple_choice" && value === question.correctAnswer
        ? Number(question.points)
        : 0;

    autoScore += automaticPoints;
    return {
      questionId: String(question.id),
      value,
      automaticPoints,
      manualPoints: Number(current.manualPoints || 0),
      teacherComment: current.teacherComment || ""
    };
  });

  return { autoScore, answers };
}

export function applyManualGrades(questions, answers, grades) {
  const questionMap = new Map(questions.map((question) => [String(question.id), question]));
  const gradeMap = new Map((grades || []).map((grade) => [String(grade.questionId), grade]));

  let manualScore = 0;
  const updatedAnswers = answers.map((answer) => {
    const question = questionMap.get(String(answer.questionId));
    const grade = gradeMap.get(String(answer.questionId));

    if (!question || question.type !== "text") {
      return { ...answer, manualPoints: 0, teacherComment: "" };
    }

    const requested = Number(grade?.points || 0);
    const manualPoints = Number.isFinite(requested)
      ? Math.max(0, Math.min(Number(question.points), requested))
      : 0;

    manualScore += manualPoints;
    return {
      ...answer,
      manualPoints,
      teacherComment: String(grade?.comment || "").trim()
    };
  });

  return { manualScore, answers: updatedAnswers };
}

export function totalExamPoints(questions) {
  return questions.reduce((sum, question) => sum + Number(question.points || 0), 0);
}

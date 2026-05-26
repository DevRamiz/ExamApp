import { useState } from "react";
import { mockApiService } from "../api/mockApiService";
import { notifyService } from "../services/notifyService";

function StudentExamPage({ currentUser }) {
  const exams = mockApiService.getPublishedExams();
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || "");
  const [answers, setAnswers] = useState({});
  const [lastResult, setLastResult] = useState(null);

  const selectedExam = exams.find((exam) => exam.id === Number(selectedExamId));

  function updateAnswer(questionId, answer) {
    setAnswers({ ...answers, [questionId]: answer });
  }

  function submitExam(event) {
    event.preventDefault();

    if (!selectedExam) {
      notifyService.error("No exam selected");
      return;
    }

    const result = mockApiService.submitExam(selectedExam.id, currentUser.id, answers);
    setLastResult(result);
    notifyService.success(`Exam submitted. Score: ${result.score}/${result.total}`);
  }

  return (
    <section className="page-card">
      <h2>Take Exam</h2>
      <p className="muted">Select an exam and answer the questions.</p>

      <label>Available Exams</label>
      <select value={selectedExamId} onChange={(event) => setSelectedExamId(event.target.value)}>
        {exams.map((exam) => (
          <option key={exam.id} value={exam.id}>{exam.title}</option>
        ))}
      </select>

      {selectedExam ? (
        <form onSubmit={submitExam} className="exam-form">
          <h3>{selectedExam.title}</h3>
          <p>{selectedExam.course}</p>

          {selectedExam.questions.map((question) => (
            <div className="question-box" key={question.id}>
              <h4>{question.text}</h4>
              {question.options.map((option) => (
                <label className="radio-label" key={option}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    onChange={() => updateAnswer(question.id, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}

          <button type="submit">Submit Exam</button>
        </form>
      ) : (
        <p>No published exams available.</p>
      )}

      {lastResult && (
        <div className="result-box">
          Last score: {lastResult.score}/{lastResult.total}
        </div>
      )}
    </section>
  );
}

export default StudentExamPage;

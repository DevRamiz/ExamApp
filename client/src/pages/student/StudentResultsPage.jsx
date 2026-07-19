import { useEffect, useState } from "react";
import { apiRequest } from "../../api/http.js";
import EmptyState from "../../components/EmptyState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

export default function StudentResultsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/submissions/my").then((data) => setSubmissions(data.submissions)).catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <header className="page-header"><div><p className="eyebrow">Student workspace</p><h1>My results</h1><p>See submission status, grades and lecturer feedback.</p></div></header>
      {error && <div className="alert alert-error">{error}</div>}
      {!submissions.length ? <EmptyState title="No exam attempts" text="Your submitted exams will appear here." /> : (
        <div className="results-layout">
          <div className="card-list">
            {submissions.map((submission) => (
              <button className={`card result-card ${selected?.id === submission.id ? "active" : ""}`} key={submission.id} onClick={() => setSelected(submission)}>
                <div className="card-title-row"><strong>{submission.exam.title}</strong><StatusBadge status={submission.status} /></div>
                <div className="meta-row"><span>{submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : "In progress"}</span><span>{submission.resultsPublished ? `${submission.finalScore}/${submission.totalPoints}` : "Result hidden"}</span></div>
              </button>
            ))}
          </div>
          <section className="card result-details">
            {!selected ? <div className="empty-state"><h3>Select an attempt</h3><p>Choose an exam to view its details.</p></div> : !selected.resultsPublished ? (
              <div className="empty-state"><h3>Result not published yet</h3><p>The lecturer is reviewing the submissions.</p></div>
            ) : (
              <div>
                <div className="result-score"><span>Final score</span><strong>{selected.finalScore} / {selected.totalPoints}</strong></div>
                {selected.feedback && <div className="feedback-box"><small>Lecturer feedback</small><p>{selected.feedback}</p></div>}
                <div className="form-stack">
                  {selected.exam.questions.map((question, index) => {
                    const answer = selected.answers.find((item) => item.questionId === question.id) || {};
                    return <div className="result-answer" key={question.id}><strong>{index + 1}. {question.text}</strong><p>Your answer: {answer.value || "No answer"}</p>{question.type === "multiple_choice" && <p>Correct answer: {question.correctAnswer}</p>}<small>Points: {(answer.automaticPoints || 0) + (answer.manualPoints || 0)} / {question.points}</small>{answer.teacherComment && <em>{answer.teacherComment}</em>}</div>;
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

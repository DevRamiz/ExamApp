import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api/http.js";
import EmptyState from "../../components/EmptyState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([apiRequest("/dashboard"), apiRequest("/exams")])
      .then(([dashboardData, examData]) => {
        setDashboard(dashboardData.dashboard);
        setExams(examData.exams);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <header className="page-header"><div><p className="eyebrow">Student workspace</p><h1>Available exams</h1><p>Start a published exam or continue an active attempt.</p></div><Link className="button button-secondary" to="/student/results">View results</Link></header>
      {error && <div className="alert alert-error">{error}</div>}
      {dashboard && <div className="stats-grid compact"><div className="stat-card"><span>Available</span><strong>{dashboard.availableExams}</strong></div><div className="stat-card"><span>In progress</span><strong>{dashboard.inProgress}</strong></div><div className="stat-card"><span>Completed</span><strong>{dashboard.completed}</strong></div><div className="stat-card"><span>Results</span><strong>{dashboard.publishedResults}</strong></div></div>}
      {!exams.length ? <EmptyState title="No published exams" text="Published exams will appear here." /> : (
        <div className="card-grid">
          {exams.map((exam) => (
            <article className="card exam-tile" key={exam.id}>
              <div className="card-title-row"><h2>{exam.title}</h2>{exam.submissionStatus && <StatusBadge status={exam.submissionStatus} />}</div>
              <p>{exam.description}</p>
              <div className="meta-row"><span>{exam.questionCount} questions</span><span>{exam.totalPoints} points</span><span>{exam.durationMinutes} minutes</span></div>
              <Link className="button button-primary" to={`/student/exams/${exam.id}`}>{exam.submissionStatus === "in_progress" ? "Continue exam" : exam.submissionStatus ? "View attempt" : "Start exam"}</Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

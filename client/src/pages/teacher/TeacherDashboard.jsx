import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api/http.js";

export default function TeacherDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/dashboard").then((data) => setDashboard(data.dashboard)).catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <header className="page-header"><div><p className="eyebrow">Lecturer workspace</p><h1>Dashboard</h1><p>Manage exams, submissions and grades.</p></div><Link className="button button-primary" to="/teacher/exams/new">Create exam</Link></header>
      {error && <div className="alert alert-error">{error}</div>}
      {!dashboard ? <div className="card">Loading dashboard...</div> : (
        <div className="stats-grid">
          <div className="stat-card"><span>Total exams</span><strong>{dashboard.exams}</strong></div>
          <div className="stat-card"><span>Published</span><strong>{dashboard.publishedExams}</strong></div>
          <div className="stat-card"><span>Submissions</span><strong>{dashboard.submissions}</strong></div>
          <div className="stat-card"><span>Waiting for grade</span><strong>{dashboard.waitingForGrade}</strong></div>
          <div className="stat-card"><span>Average score</span><strong>{dashboard.averageScore ?? "—"}</strong></div>
        </div>
      )}
      <section className="card section-card"><h2>Quick workflow</h2><div className="flow-row"><span>1. Create draft</span><span>2. Add questions</span><span>3. Publish</span><span>4. Grade</span><span>5. Publish results</span></div></section>
    </div>
  );
}

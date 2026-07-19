import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api/http.js";
import EmptyState from "../../components/EmptyState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

export default function TeacherExamsPage() {
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  async function load() {
    try { setExams((await apiRequest("/exams")).exams); } catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);

  async function action(id, endpoint, method = "PATCH") {
    try { await apiRequest(`/exams/${id}${endpoint}`, { method }); await load(); } catch (err) { setError(err.message); }
  }

  const filtered = exams.filter((exam) => exam.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <header className="page-header"><div><p className="eyebrow">Lecturer workspace</p><h1>Manage exams</h1><p>Create, publish and review exams.</p></div><Link className="button button-primary" to="/teacher/exams/new">New exam</Link></header>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="toolbar"><input placeholder="Search exams..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      {!filtered.length ? <EmptyState title="No exams found" text="Create a new exam or change the search text." /> : (
        <div className="card-list">
          {filtered.map((exam) => (
            <article className="card exam-card" key={exam.id}>
              <div><div className="card-title-row"><h2>{exam.title}</h2><StatusBadge status={exam.status} /></div><p>{exam.description || "No description"}</p><div className="meta-row"><span>{exam.questionCount} questions</span><span>{exam.totalPoints} points</span><span>{exam.durationMinutes} minutes</span><span>Pass: {exam.passScore}%</span><span>{exam.submissionCount} submissions</span></div></div>
              <div className="actions">
                {exam.status === "draft" && <Link className="button button-secondary" to={`/teacher/exams/${exam.id}/edit`}>Edit</Link>}
                {exam.status === "draft" && <button className="button button-primary" onClick={() => action(exam.id, "/publish")}>Publish</button>}
                {exam.status === "published" && <button className="button button-secondary" onClick={() => action(exam.id, "/close")}>Close exam</button>}
                <Link className="button button-secondary" to={`/teacher/exams/${exam.id}/submissions`}>Submissions</Link>
                {exam.status !== "draft" && <Link className="button button-secondary" to={`/teacher/exams/${exam.id}/monitor`}>Live monitor</Link>}
                <Link className="button button-secondary" to="/teacher/analytics">Analytics</Link>
                {exam.status === "draft" && <button className="button button-danger" onClick={() => { if (confirm("Delete this draft?")) action(exam.id, "", "DELETE"); }}>Delete</button>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

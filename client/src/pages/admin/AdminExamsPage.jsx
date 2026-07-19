import { useEffect, useState } from "react";
import { apiRequest } from "../../api/http.js";

export default function AdminExamsPage() {
  const [exams, setExams] = useState([]); const [error, setError] = useState("");
  async function load() { try { setExams((await apiRequest("/admin/exams")).exams); } catch (err) { setError(err.message); } }
  useEffect(() => { load(); }, []);
  async function remove(exam) { if (!confirm(`Delete ${exam.title} and all its submissions?`)) return; try { await apiRequest(`/admin/exams/${exam.id}`, { method: "DELETE" }); load(); } catch (err) { setError(err.message); } }
  return <div><header className="page-header"><div><p className="eyebrow">Admin tools</p><h1>System exams</h1><p>Use deletion only for invalid or demonstration data.</p></div></header>{error && <div className="alert alert-error">{error}</div>}<div className="table-card"><table><thead><tr><th>Exam</th><th>Lecturer</th><th>Status</th><th>Submissions</th><th></th></tr></thead><tbody>{exams.map((exam) => <tr key={exam.id}><td><strong>{exam.title}</strong><small>Updated {new Date(exam.updatedAt).toLocaleString()}</small></td><td><strong>{exam.lecturer.name}</strong><small>{exam.lecturer.email}</small></td><td>{exam.status}</td><td>{exam.submissionCount}</td><td><button className="button button-small button-danger" onClick={() => remove(exam)}>Delete</button></td></tr>)}</tbody></table></div></div>;
}

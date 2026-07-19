import { useEffect, useState } from "react";
import { apiRequest, downloadApiFile, openApiHtml } from "../../api/http.js";

function Metric({ label, value, suffix = "" }) {
  return <div className="stat-card"><small>{label}</small><strong>{value ?? "—"}{value != null ? suffix : ""}</strong></div>;
}

export default function TeacherAnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [exams, setExams] = useState([]);
  const [selected, setSelected] = useState("");
  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([apiRequest("/analytics/teacher"), apiRequest("/exams")])
      .then(([analyticsData, examData]) => {
        setOverview(analyticsData.analytics);
        setExams(examData.exams);
        if (examData.exams[0]) setSelected(String(examData.exams[0].id));
      }).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selected) return;
    apiRequest(`/analytics/exams/${selected}`).then((data) => setDetails(data.analytics)).catch((err) => setError(err.message));
  }, [selected]);

  return <div>
    <header className="page-header"><div><p className="eyebrow">Statistics and reports</p><h1>Lecturer analytics</h1><p>Read-only insights that do not change exam data.</p></div></header>
    {error && <div className="alert alert-error">{error}</div>}
    {overview && <div className="stats-grid"><Metric label="Exams" value={overview.exams} /><Metric label="Attempts" value={overview.attempts} /><Metric label="Active now" value={overview.activeAttempts} /><Metric label="Waiting for grade" value={overview.waitingForGrade} /><Metric label="Average score" value={overview.averageScore} /><Metric label="Highest score" value={overview.highestScore} /></div>}
    <section className="card form-grid analytics-controls">
      <label>Exam<select value={selected} onChange={(e) => setSelected(e.target.value)}>{exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.title}</option>)}</select></label>
      <div className="report-actions"><button className="button button-secondary" disabled={!selected} onClick={() => downloadApiFile(`/reports/exams/${selected}.csv`, "exam-results.csv")}>Download CSV</button><button className="button button-secondary" disabled={!selected} onClick={() => openApiHtml(`/reports/exams/${selected}.html`)}>Printable report</button></div>
    </section>
    {details && <>
      <div className="stats-grid"><Metric label="Submissions" value={details.summary.attempts} /><Metric label="Graded" value={details.summary.graded} /><Metric label="Average" value={details.summary.averagePercentage} suffix="%" /><Metric label="Pass rate" value={details.summary.passRate} suffix="%" /><Metric label="Highest" value={details.summary.highestPercentage} suffix="%" /><Metric label="Lowest" value={details.summary.lowestPercentage} suffix="%" /></div>
      <section className="card"><div className="section-heading"><h2>Question performance</h2><span>Lower bars show questions worth reviewing.</span></div><div className="analytics-list">{details.questions.map((question, index) => <div className="analytics-row" key={question.questionId}><div><strong>{index + 1}. {question.text}</strong><small>{question.attempted} attempted · average {question.averagePoints}/{question.points}</small></div><div className="bar-track"><span style={{ width: `${Math.max(0, Math.min(100, question.successRate))}%` }} /></div><strong>{question.successRate}%</strong></div>)}</div></section>
      <section className="table-card"><table><thead><tr><th>Student</th><th>Status</th><th>Score</th><th>Percentage</th></tr></thead><tbody>{details.students.map((student) => <tr key={student.submissionId}><td><strong>{student.name}</strong><small>{student.email}</small></td><td>{student.status}</td><td>{student.finalScore ?? "—"}</td><td>{student.percentage == null ? "—" : `${student.percentage}%`}</td></tr>)}</tbody></table></section>
    </>}
  </div>;
}

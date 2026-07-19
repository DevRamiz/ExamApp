import { useEffect, useState } from "react";
import { apiRequest } from "../../api/http.js";

export default function StudentAnalyticsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { apiRequest("/analytics/student").then(({ analytics }) => setData(analytics)).catch((err) => setError(err.message)); }, []);
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <div className="card">Loading analytics...</div>;
  return <div><header className="page-header"><div><p className="eyebrow">Personal progress</p><h1>My analytics</h1><p>Only results that your lecturer published are included.</p></div></header>
    <div className="stats-grid"><div className="stat-card"><small>Published results</small><strong>{data.completedResults}</strong></div><div className="stat-card"><small>Average</small><strong>{data.averagePercentage ?? "—"}{data.averagePercentage != null ? "%" : ""}</strong></div><div className="stat-card"><small>Highest</small><strong>{data.highestPercentage ?? "—"}{data.highestPercentage != null ? "%" : ""}</strong></div><div className="stat-card"><small>Passed</small><strong>{data.passed}</strong></div></div>
    <section className="card"><h2>Grade history</h2>{!data.history.length ? <p>No published results yet.</p> : <div className="analytics-list">{data.history.map((item) => <div className="analytics-row" key={item.submissionId}><div><strong>{item.title}</strong><small>{new Date(item.date).toLocaleDateString()} · {item.passed ? "Passed" : "Needs improvement"}</small></div><div className="bar-track"><span style={{ width: `${item.percentage}%` }} /></div><strong>{item.percentage}%</strong></div>)}</div>}</section>
  </div>;
}

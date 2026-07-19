import { useEffect, useState } from "react";
import { apiRequest } from "../../api/http.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { apiRequest("/admin/stats").then((data) => setStats(data.stats)).catch((err) => setError(err.message)); }, []);
  return <div><header className="page-header"><div><p className="eyebrow">Administration</p><h1>System dashboard</h1><p>Manage accounts, inspect platform activity, and keep the data clean.</p></div></header>{error && <div className="alert alert-error">{error}</div>}{stats && <div className="stats-grid">{Object.entries({ Users: stats.users, Teachers: stats.teachers, Students: stats.students, "Disabled users": stats.disabled_users, Exams: stats.exams, "Published exams": stats.published_exams, Submissions: stats.submissions, "Active attempts": stats.active_attempts, "Audit events (24h)": stats.audit_events_24h }).map(([label, value]) => <div className="stat-card" key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>}<section className="card"><h2>Admin responsibilities</h2><p>Admin tools are intentionally separate from lecturer grading. Use them for account management, unlocking users, deleting test exams, resetting attempts, and reviewing audit records.</p></section></div>;
}

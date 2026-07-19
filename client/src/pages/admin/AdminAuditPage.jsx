import { useEffect, useState } from "react";
import { apiRequest } from "../../api/http.js";
export default function AdminAuditPage() {
  const [audits, setAudits] = useState([]); const [error, setError] = useState("");
  useEffect(() => { apiRequest("/admin/audits?limit=200").then((data) => setAudits(data.audits)).catch((err) => setError(err.message)); }, []);
  return <div><header className="page-header"><div><p className="eyebrow">Security and operations</p><h1>Audit logs</h1><p>Important authentication, exam, grading, report, AI, and admin actions.</p></div></header>{error && <div className="alert alert-error">{error}</div>}<div className="table-card"><table><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>IP</th></tr></thead><tbody>{audits.map((item) => <tr key={item.id}><td>{new Date(item.createdAt).toLocaleString()}</td><td>{item.user ? <><strong>{item.user.name}</strong><small>{item.user.email}</small></> : "System"}</td><td><code>{item.action}</code></td><td>{item.entityType || "—"} {item.entityId || ""}</td><td>{item.ipAddress || "—"}</td></tr>)}</tbody></table></div></div>;
}

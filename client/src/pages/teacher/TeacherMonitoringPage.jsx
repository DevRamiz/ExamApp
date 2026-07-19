import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../../api/http.js";
import { useRealtimeNotifications } from "../../hooks/useRealtimeNotifications.js";

function connectionLabel(item) {
  if (item.status !== "in_progress") return "Submitted";
  if (item.connectionStatus === "online") return "Online";
  return "Offline";
}

export default function TeacherMonitoringPage() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [examData, monitoringData] = await Promise.all([apiRequest(`/exams/${id}`), apiRequest(`/monitoring/exams/${id}`)]);
      setExam(examData.exam);
      setItems(monitoringData.monitoring);
    } catch (err) { setError(err.message); }
  }, [id]);

  useEffect(() => { load(); const timer = window.setInterval(load, 15_000); return () => window.clearInterval(timer); }, [load]);
  useRealtimeNotifications(useCallback((event) => {
    if (event.type !== "exam_monitor_update" || Number(event.monitor?.examId) !== Number(id)) return;
    setItems((current) => {
      const exists = current.some((item) => item.submissionId === event.monitor.submissionId);
      return exists ? current.map((item) => item.submissionId === event.monitor.submissionId ? event.monitor : item) : [event.monitor, ...current];
    });
  }, [id]));

  return <div><header className="page-header"><div><p className="eyebrow">Real-time monitoring</p><h1>{exam?.title || "Exam monitor"}</h1><p>Progress signals help supervision, but they are not automatic proof of cheating.</p></div><Link className="button button-secondary" to={`/teacher/exams/${id}/submissions`}>Submissions</Link></header>
    {error && <div className="alert alert-error">{error}</div>}
    {!items.length ? <div className="card empty-state"><h2>No student has started yet</h2><p>This screen updates when students open the exam.</p></div> : <div className="monitor-grid">{items.map((item) => <article className="card monitor-card" key={item.submissionId}><div className="monitor-card-header"><div><strong>{item.student.name}</strong><small>{item.student.email}</small></div><span className={`presence ${item.connectionStatus}`}>{connectionLabel(item)}</span></div><div className="monitor-progress"><div className="bar-track"><span style={{ width: `${item.questionCount ? (item.answeredCount / item.questionCount) * 100 : 0}%` }} /></div><strong>{item.answeredCount}/{item.questionCount} answered</strong></div><dl><div><dt>Started</dt><dd>{new Date(item.startedAt).toLocaleTimeString()}</dd></div><div><dt>Last seen</dt><dd>{item.lastSeenAt ? new Date(item.lastSeenAt).toLocaleTimeString() : "—"}</dd></div><div><dt>Tab changes</dt><dd>{item.tabSwitches}</dd></div><div><dt>Status</dt><dd>{item.status.replaceAll("_", " ")}</dd></div></dl></article>)}</div>}
  </div>;
}

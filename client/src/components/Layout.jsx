import { useCallback, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useRealtimeNotifications } from "../hooks/useRealtimeNotifications.js";
import NotificationCenter from "./NotificationCenter.jsx";

function messageFor(event) {
  if (event.type === "exam_published") return `New exam published: ${event.title}`;
  if (event.type === "results_published") return `Results published for: ${event.title}`;
  if (event.type === "submission_received") return `${event.studentName || "A student"} submitted ${event.title || "an exam"}`;
  if (event.type === "notification_created") return event.notification?.title || "New notification";
  return event.message || "ExamFlow updated in real time.";
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  const [notificationVersion, setNotificationVersion] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNotification = useCallback((event) => {
    if (event.type === "exam_monitor_update") return;
    setToast(messageFor(event));
    if (["notification_created", "exam_published", "results_published", "submission_received"].includes(event.type)) {
      setNotificationVersion((value) => value + 1);
    }
    window.setTimeout(() => setToast(""), 5000);
  }, []);
  useRealtimeNotifications(handleNotification);

  const links = user.role === "admin"
    ? [["/admin", "Dashboard"], ["/admin/users", "Users"], ["/admin/exams", "System exams"], ["/admin/audits", "Audit logs"]]
    : user.role === "teacher"
      ? [["/teacher", "Dashboard"], ["/teacher/exams", "Exams"], ["/teacher/exams/new", "Create exam"], ["/teacher/analytics", "Analytics"]]
      : [["/student", "Available exams"], ["/student/results", "My results"], ["/student/analytics", "My analytics"]];

  return (
    <div className="app-shell">
      <button className="mobile-menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation">☰</button>
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand"><span>EF</span><div><strong>ExamFlow</strong><small>Exam management</small></div></div>
        <nav>
          {links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} end={["/teacher", "/student", "/admin"].includes(to)}>{label}</NavLink>)}
        </nav>
        <div className="sidebar-user">
          <strong>{user.name}</strong><small>{user.role}</small>
          <button className="button button-ghost" onClick={() => { logout(); navigate("/login"); }}>Log out</button>
        </div>
      </aside>
      {menuOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <main className="content">
        <div className="content-toolbar"><NotificationCenter refreshSignal={notificationVersion} /></div>
        {toast && <div className="notification">{toast}</div>}
        <Outlet />
      </main>
    </div>
  );
}

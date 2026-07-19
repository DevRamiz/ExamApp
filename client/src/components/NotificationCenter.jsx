import { useEffect, useState } from "react";
import { apiRequest } from "../api/http.js";

export default function NotificationCenter({ refreshSignal = 0 }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function load() {
    try {
      const data = await apiRequest("/notifications");
      setItems(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // Notifications are an enhancement; a temporary failure should not block navigation.
    }
  }

  useEffect(() => { load(); }, [refreshSignal]);

  async function markRead(id) {
    await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
    setItems((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
    setUnreadCount((count) => Math.max(0, count - 1));
  }

  async function markAll() {
    await apiRequest("/notifications/read-all", { method: "PATCH" });
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  }

  return (
    <div className="notification-center">
      <button className="notification-bell" onClick={() => setOpen((value) => !value)} aria-label="Notifications">
        🔔{unreadCount > 0 && <span>{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header"><strong>Notifications</strong><button className="text-button" onClick={markAll}>Mark all read</button></div>
          {!items.length ? <p className="muted-block">No notifications yet.</p> : items.map((item) => (
            <button key={item.id} className={`notification-item ${item.isRead ? "" : "unread"}`} onClick={() => markRead(item.id)}>
              <strong>{item.title}</strong><span>{item.message}</span><small>{new Date(item.createdAt).toLocaleString()}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

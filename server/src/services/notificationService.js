import { pool } from "../db/pool.js";

let broadcast = () => {};

export function setNotificationBroadcaster(handler) {
  broadcast = handler;
}

export function notify(event) {
  broadcast({ ...event, sentAt: new Date().toISOString() });
}

function mapNotification(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    data: row.data || {},
    isRead: row.is_read,
    createdAt: row.created_at,
    readAt: row.read_at
  };
}

export async function createForUsers(userIds, notification) {
  const uniqueIds = [...new Set((userIds || []).map(Number).filter(Number.isFinite))];
  if (!uniqueIds.length) return [];
  const result = await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, data)
     SELECT target.user_id, $2, $3, $4, $5::jsonb
     FROM UNNEST($1::integer[]) AS target(user_id)
     RETURNING *`,
    [uniqueIds, notification.type, notification.title, notification.message || "", JSON.stringify(notification.data || {})]
  );
  for (const row of result.rows) {
    notify({ type: "notification_created", targetUserId: row.user_id, notification: mapNotification(row) });
  }
  return result.rows.map(mapNotification);
}

export async function createForRole(role, notification) {
  const users = await pool.query("SELECT id FROM users WHERE role = $1 AND is_active = TRUE", [role]);
  return createForUsers(users.rows.map((row) => row.id), notification);
}

export async function listNotifications(userId, { limit = 50 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const result = await pool.query(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, safeLimit]
  );
  const unread = await pool.query(
    "SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE",
    [userId]
  );
  return { notifications: result.rows.map(mapNotification), unreadCount: unread.rows[0].count };
}

export async function markRead(notificationId, userId) {
  const result = await pool.query(
    `UPDATE notifications
     SET is_read = TRUE, read_at = COALESCE(read_at, NOW())
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [notificationId, userId]
  );
  return result.rowCount ? mapNotification(result.rows[0]) : null;
}

export async function markAllRead(userId) {
  const result = await pool.query(
    `UPDATE notifications
     SET is_read = TRUE, read_at = COALESCE(read_at, NOW())
     WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
  return { updatedCount: result.rowCount };
}

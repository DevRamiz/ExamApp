import { pool } from "../db/pool.js";

export async function writeAudit({ userId = null, action, entityType = null, entityId = null, details = {}, ipAddress = null }) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6)`,
      [userId, action, entityType, entityId == null ? null : String(entityId), JSON.stringify(details), ipAddress]
    );
  } catch (error) {
    // Auditing must never stop the main user action. The failure is still visible in server logs.
    console.error("Audit log write failed:", error.message);
  }
}

export async function listAuditLogs({ limit = 100, offset = 0 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
  const safeOffset = Math.max(Number(offset) || 0, 0);
  const result = await pool.query(
    `SELECT a.id, a.action, a.entity_type, a.entity_id, a.details, a.ip_address, a.created_at,
            u.id AS user_id, u.name AS user_name, u.email AS user_email, u.role AS user_role
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.user_id
     ORDER BY a.created_at DESC
     LIMIT $1 OFFSET $2`,
    [safeLimit, safeOffset]
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    details: row.details || {},
    ipAddress: row.ip_address,
    createdAt: row.created_at,
    user: row.user_id ? { id: row.user_id, name: row.user_name, email: row.user_email, role: row.user_role } : null
  }));
}

import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { requireEmail, requireText } from "../utils/validation.js";
import { createToken } from "./tokenService.js";
import { writeAudit } from "./auditService.js";

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    isActive: row.is_active !== false
  };
}

function validatePassword(password) {
  if (password.length < 8) {
    throw new AppError(400, "Password must contain at least 8 characters.");
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new AppError(400, "Password must contain at least one letter and one number.");
  }
}

export async function registerStudent(payload, context = {}) {
  const name = requireText(payload.name, "Name", 100);
  const email = requireEmail(payload.email);
  const password = requireText(payload.password, "Password", 200);
  validatePassword(password);

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rowCount) {
    throw new AppError(409, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'student')
     RETURNING id, name, email, role, is_active`,
    [name, email, passwordHash]
  );
  const user = publicUser(result.rows[0]);
  await writeAudit({ userId: user.id, action: "auth.register", entityType: "user", entityId: user.id, ipAddress: context.ipAddress });
  return { user, token: createToken(user) };
}

export async function login(payload, context = {}) {
  const email = requireEmail(payload.email);
  const password = requireText(payload.password, "Password", 200);
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const row = result.rows[0];

  if (row?.locked_until && new Date(row.locked_until).getTime() > Date.now()) {
    throw new AppError(423, "This account is temporarily locked after repeated failed logins.");
  }
  if (row && row.is_active === false) {
    throw new AppError(403, "This account is disabled. Contact an administrator.");
  }

  const valid = row ? await bcrypt.compare(password, row.password_hash) : false;
  if (!row || !valid) {
    if (row) {
      const attempts = Number(row.failed_login_attempts || 0) + 1;
      const shouldLock = attempts >= env.loginMaxAttempts;
      await pool.query(
        `UPDATE users
         SET failed_login_attempts = $1,
             locked_until = CASE WHEN $2::boolean THEN NOW() + ($3::integer * INTERVAL '1 minute') ELSE NULL END,
             updated_at = NOW()
         WHERE id = $4`,
        [shouldLock ? 0 : attempts, shouldLock, env.loginLockMinutes, row.id]
      );
      await writeAudit({
        userId: row.id,
        action: shouldLock ? "auth.account_locked" : "auth.login_failed",
        entityType: "user",
        entityId: row.id,
        details: { attempts: shouldLock ? env.loginMaxAttempts : attempts },
        ipAddress: context.ipAddress
      });
    }
    throw new AppError(401, "Email or password is incorrect.");
  }

  await pool.query(
    "UPDATE users SET failed_login_attempts = 0, locked_until = NULL, updated_at = NOW() WHERE id = $1",
    [row.id]
  );
  const user = publicUser(row);
  await writeAudit({ userId: user.id, action: "auth.login", entityType: "user", entityId: user.id, ipAddress: context.ipAddress });
  return { user, token: createToken(user) };
}

export async function getCurrentUser(userId) {
  const result = await pool.query(
    "SELECT id, name, email, role, is_active FROM users WHERE id = $1",
    [userId]
  );
  if (!result.rowCount) throw new AppError(404, "User was not found.");
  if (!result.rows[0].is_active) throw new AppError(403, "This account is disabled.");
  return publicUser(result.rows[0]);
}

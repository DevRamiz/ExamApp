import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import { AppError } from "../utils/AppError.js";

export async function authenticate(req, _res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return next(new AppError(401, "Authentication is required."));

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const result = await pool.query("SELECT id, name, email, role, is_active FROM users WHERE id = $1", [Number(payload.sub)]);
    const user = result.rows[0];
    if (!user || !user.is_active) return next(new AppError(401, "This session is no longer active."));
    req.user = { id: user.id, role: user.role, name: user.name, email: user.email };
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(new AppError(401, "The authentication token is invalid or expired."));
  }
}

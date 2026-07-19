import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function createToken(user) {
  return jwt.sign(
    { role: user.role, name: user.name, email: user.email },
    env.jwtSecret,
    { subject: String(user.id), expiresIn: env.jwtExpiresIn }
  );
}

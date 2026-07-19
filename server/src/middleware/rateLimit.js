import { AppError } from "../utils/AppError.js";

const buckets = new Map();

/**
 * Small dependency-free rate limiter. It is sufficient for a single-process class project.
 * A distributed production deployment should store counters in Redis instead.
 */
export function rateLimit({ windowMs = 60_000, max = 60, keyPrefix = "global" } = {}) {
  return (req, _res, next) => {
    const now = Date.now();
    const identity = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${keyPrefix}:${identity}`;
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;
    if (current.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      const error = new AppError(429, `Too many requests. Try again in ${retryAfterSeconds} seconds.`);
      error.details = { retryAfterSeconds };
      return next(error);
    }
    next();
  };
}

export function requestContext(req, _res, next) {
  req.requestIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || req.socket.remoteAddress || null;
  next();
}

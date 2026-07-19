import * as authService from "../services/authService.js";

export async function register(req, res) {
  const result = await authService.registerStudent(req.body, { ipAddress: req.requestIp });
  res.status(201).json(result);
}

export async function login(req, res) {
  res.json(await authService.login(req.body, { ipAddress: req.requestIp }));
}

export async function me(req, res) {
  res.json({ user: await authService.getCurrentUser(req.user.id) });
}

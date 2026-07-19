import * as service from "../services/notificationService.js";
import { AppError } from "../utils/AppError.js";

export async function list(req, res) {
  res.json(await service.listNotifications(req.user.id, req.query));
}

export async function readOne(req, res) {
  const notification = await service.markRead(Number(req.params.id), req.user.id);
  if (!notification) throw new AppError(404, "Notification was not found.");
  res.json({ notification });
}

export async function readAll(req, res) {
  res.json(await service.markAllRead(req.user.id));
}

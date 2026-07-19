import * as service from "../services/analyticsService.js";

export async function teacher(req, res) {
  res.json({ analytics: await service.teacherOverview(req.user.id) });
}

export async function exam(req, res) {
  res.json({ analytics: await service.examAnalytics(Number(req.params.id), req.user.id) });
}

export async function student(req, res) {
  res.json({ analytics: await service.studentAnalytics(req.user.id) });
}

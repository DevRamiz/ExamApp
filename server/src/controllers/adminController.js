import * as service from "../services/adminService.js";

export async function stats(_req, res) { res.json({ stats: await service.systemStats() }); }
export async function users(req, res) { res.json({ users: await service.listUsers(req.query) }); }
export async function createUser(req, res) { res.status(201).json({ user: await service.createUser(req.user.id, req.body, { ipAddress: req.requestIp }) }); }
export async function updateUser(req, res) { res.json({ user: await service.updateUser(req.user.id, Number(req.params.id), req.body, { ipAddress: req.requestIp }) }); }
export async function exams(_req, res) { res.json({ exams: await service.listExams() }); }
export async function deleteExam(req, res) { await service.deleteExam(req.user.id, Number(req.params.id), { ipAddress: req.requestIp }); res.status(204).end(); }
export async function resetSubmission(req, res) { res.json({ submission: await service.resetSubmission(req.user.id, Number(req.params.id), { ipAddress: req.requestIp }) }); }
export async function audits(req, res) { res.json({ audits: await service.listAuditLogs(req.query) }); }

import * as examService from "../services/examService.js";

const context = (req) => ({ ipAddress: req.requestIp });
export async function list(req, res) { res.json({ exams: await examService.listExams(req.user) }); }
export async function getOne(req, res) { res.json({ exam: await examService.getExam(Number(req.params.id), req.user) }); }
export async function create(req, res) { res.status(201).json({ exam: await examService.createExam(req.user.id, req.body, context(req)) }); }
export async function update(req, res) { res.json({ exam: await examService.updateExam(Number(req.params.id), req.user.id, req.body, context(req)) }); }
export async function remove(req, res) { await examService.deleteExam(Number(req.params.id), req.user.id, context(req)); res.status(204).end(); }
export async function publish(req, res) { res.json({ exam: await examService.publishExam(Number(req.params.id), req.user.id, context(req)) }); }
export async function close(req, res) { res.json({ exam: await examService.closeExam(Number(req.params.id), req.user.id, context(req)) }); }
export async function submissions(req, res) { res.json({ submissions: await examService.listExamSubmissions(Number(req.params.id), req.user.id) }); }
export async function publishResults(req, res) { res.json(await examService.publishResults(Number(req.params.id), req.user.id, context(req))); }

import * as submissionService from "../services/submissionService.js";
const context = (req) => ({ ipAddress: req.requestIp });
export async function start(req, res) { res.status(201).json({ submission: await submissionService.startSubmission(Number(req.params.examId), req.user.id, context(req)) }); }
export async function autosave(req, res) { res.json(await submissionService.autosaveSubmission(Number(req.params.id), req.user.id, req.body.answers)); }
export async function submit(req, res) { res.json(await submissionService.submitExam(Number(req.params.id), req.user.id, req.body.answers, context(req))); }
export async function mySubmissions(req, res) { res.json({ submissions: await submissionService.listMySubmissions(req.user.id) }); }
export async function getOne(req, res) { res.json({ submission: await submissionService.getSubmission(Number(req.params.id), req.user) }); }
export async function grade(req, res) { res.json({ submission: await submissionService.gradeSubmission(Number(req.params.id), req.user.id, req.body, context(req)) }); }

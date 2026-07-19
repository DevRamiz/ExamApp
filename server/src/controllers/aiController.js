import * as service from "../services/aiGatewayService.js";

export async function questions(req, res) {
  res.json(await service.generateQuestions(req.user.id, req.body, { ipAddress: req.requestIp }));
}

export async function feedback(req, res) {
  res.json(await service.suggestFeedback(Number(req.params.id), req.user, { ipAddress: req.requestIp }));
}

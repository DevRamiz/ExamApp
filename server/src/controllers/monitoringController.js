import * as service from "../services/monitoringService.js";

export async function examMonitoring(req, res) {
  res.json({ monitoring: await service.listExamMonitoring(Number(req.params.id), req.user.id) });
}

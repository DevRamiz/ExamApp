import * as service from "../services/reportGatewayService.js";

function safeFilename(value) {
  return String(value || "exam-report").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "") || "exam-report";
}

export async function csv(req, res) {
  const result = await service.generateExamReport(Number(req.params.id), req.user.id, "csv", { ipAddress: req.requestIp });
  res.setHeader("content-type", "text/csv; charset=utf-8");
  res.setHeader("content-disposition", `attachment; filename="${safeFilename(result.examTitle)}-results.csv"`);
  res.send(`\ufeff${result.content}`);
}

export async function html(req, res) {
  const result = await service.generateExamReport(Number(req.params.id), req.user.id, "html", { ipAddress: req.requestIp });
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.send(result.content);
}

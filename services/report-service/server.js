import http from "node:http";

const port = Number(process.env.PORT || 4102);

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 5_000_000) throw new Error("Report request is too large.");
  }
  return raw ? JSON.parse(raw) : {};
}

function csvCell(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function buildCsv(report) {
  const headers = ["Student", "Email", "Status", "Automatic score", "Manual score", "Final score", "Started", "Submitted", "Results published"];
  const rows = (report.submissions || []).map((item) => [
    item.student?.name, item.student?.email, item.status, item.autoScore, item.manualScore,
    item.finalScore, item.startedAt, item.submittedAt, item.resultsPublished ? "Yes" : "No"
  ]);
  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function buildHtml(report) {
  const rows = (report.submissions || []).map((item) => `<tr><td>${escapeHtml(item.student?.name)}</td><td>${escapeHtml(item.student?.email)}</td><td>${escapeHtml(item.status)}</td><td>${escapeHtml(item.finalScore ?? "—")}</td><td>${escapeHtml(item.submittedAt ?? "—")}</td></tr>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(report.exam?.title)} report</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#172033}h1{margin-bottom:4px}.muted{color:#667085}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{text-align:left;border-bottom:1px solid #ddd;padding:10px}th{background:#f5f7fb}@media print{button{display:none}}</style></head><body><button onclick="print()">Print / Save as PDF</button><h1>${escapeHtml(report.exam?.title)}</h1><p class="muted">Generated ${escapeHtml(new Date().toISOString())}</p><p>Total submissions: ${report.submissions?.length || 0}</p><table><thead><tr><th>Student</th><th>Email</th><th>Status</th><th>Final score</th><th>Submitted</th></tr></thead><tbody>${rows || '<tr><td colspan="5">No submissions</td></tr>'}</tbody></table></body></html>`;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ status: "ok", service: "examflow-report" }));
    }
    if (req.method !== "POST" || !["/csv", "/html"].includes(req.url)) {
      res.writeHead(404, { "content-type": "application/json" });
      return res.end(JSON.stringify({ error: "Route not found." }));
    }
    const report = await readJson(req);
    const html = req.url === "/html";
    res.writeHead(200, { "content-type": html ? "text/html; charset=utf-8" : "text/csv; charset=utf-8" });
    res.end(html ? buildHtml(report) : buildCsv(report));
  } catch (error) {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: error.message || "Report service failed." }));
  }
});
server.listen(port, () => console.log(`ExamFlow report service listening on ${port}`));

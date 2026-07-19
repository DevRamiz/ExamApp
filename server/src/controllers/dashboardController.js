import * as dashboardService from "../services/dashboardService.js";
import { systemStats } from "../services/adminService.js";

export async function dashboard(req, res) {
  const data = req.user.role === "admin"
    ? await systemStats()
    : req.user.role === "teacher"
      ? await dashboardService.teacherDashboard(req.user.id)
      : await dashboardService.studentDashboard(req.user.id);
  res.json({ dashboard: data });
}

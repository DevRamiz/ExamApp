import { Router } from "express";
import { examMonitoring } from "../controllers/monitoringController.js";
import { authenticate } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const monitoringRouter = Router();
monitoringRouter.use(authenticate, allowRoles("teacher"));
monitoringRouter.get("/exams/:id", asyncHandler(examMonitoring));

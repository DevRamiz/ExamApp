import { Router } from "express";
import * as controller from "../controllers/analyticsController.js";
import { authenticate } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const analyticsRouter = Router();
analyticsRouter.use(authenticate);
analyticsRouter.get("/teacher", allowRoles("teacher"), asyncHandler(controller.teacher));
analyticsRouter.get("/exams/:id", allowRoles("teacher"), asyncHandler(controller.exam));
analyticsRouter.get("/student", allowRoles("student"), asyncHandler(controller.student));

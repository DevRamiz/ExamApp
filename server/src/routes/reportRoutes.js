import { Router } from "express";
import * as controller from "../controllers/reportController.js";
import { authenticate } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const reportRouter = Router();
reportRouter.use(authenticate, allowRoles("teacher"));
reportRouter.get("/exams/:id.csv", asyncHandler(controller.csv));
reportRouter.get("/exams/:id.html", asyncHandler(controller.html));

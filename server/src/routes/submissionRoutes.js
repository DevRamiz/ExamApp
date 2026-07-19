import { Router } from "express";
import * as controller from "../controllers/submissionController.js";
import { authenticate } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const submissionRouter = Router();
submissionRouter.use(authenticate);
submissionRouter.get("/my", allowRoles("student"), asyncHandler(controller.mySubmissions));
submissionRouter.get("/:id", asyncHandler(controller.getOne));
submissionRouter.patch("/:id/autosave", allowRoles("student"), asyncHandler(controller.autosave));
submissionRouter.post("/:id/submit", allowRoles("student"), asyncHandler(controller.submit));
submissionRouter.patch("/:id/grade", allowRoles("teacher"), asyncHandler(controller.grade));

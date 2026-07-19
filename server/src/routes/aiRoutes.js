import { Router } from "express";
import * as controller from "../controllers/aiController.js";
import { authenticate } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const aiRouter = Router();
aiRouter.use(authenticate, allowRoles("teacher"), rateLimit({ windowMs: 60_000, max: 20, keyPrefix: "ai" }));
aiRouter.post("/generate-questions", asyncHandler(controller.questions));
aiRouter.post("/submissions/:id/feedback-suggestion", asyncHandler(controller.feedback));

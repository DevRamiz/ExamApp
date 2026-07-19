import { Router } from "express";
import { dashboard } from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboardRouter = Router();
dashboardRouter.get("/", authenticate, asyncHandler(dashboard));

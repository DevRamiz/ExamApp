import { Router } from "express";
import * as controller from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRouter = Router();
const authLimiter = rateLimit({ windowMs: 60_000, max: 12, keyPrefix: "auth" });
authRouter.post("/register", authLimiter, asyncHandler(controller.register));
authRouter.post("/login", authLimiter, asyncHandler(controller.login));
authRouter.get("/me", authenticate, asyncHandler(controller.me));

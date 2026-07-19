import { Router } from "express";
import * as controller from "../controllers/notificationController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const notificationRouter = Router();
notificationRouter.use(authenticate);
notificationRouter.get("/", asyncHandler(controller.list));
notificationRouter.patch("/read-all", asyncHandler(controller.readAll));
notificationRouter.patch("/:id/read", asyncHandler(controller.readOne));

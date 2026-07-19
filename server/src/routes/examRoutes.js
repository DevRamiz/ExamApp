import { Router } from "express";
import * as controller from "../controllers/examController.js";
import * as submissionController from "../controllers/submissionController.js";
import { authenticate } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const examRouter = Router();
examRouter.use(authenticate);
examRouter.get("/", asyncHandler(controller.list));
examRouter.get("/:id", asyncHandler(controller.getOne));
examRouter.post("/", allowRoles("teacher"), asyncHandler(controller.create));
examRouter.put("/:id", allowRoles("teacher"), asyncHandler(controller.update));
examRouter.delete("/:id", allowRoles("teacher"), asyncHandler(controller.remove));
examRouter.patch("/:id/publish", allowRoles("teacher"), asyncHandler(controller.publish));
examRouter.patch("/:id/close", allowRoles("teacher"), asyncHandler(controller.close));
examRouter.get("/:id/submissions", allowRoles("teacher"), asyncHandler(controller.submissions));
examRouter.patch("/:id/results/publish", allowRoles("teacher"), asyncHandler(controller.publishResults));
examRouter.post("/:examId/start", allowRoles("student"), asyncHandler(submissionController.start));

import { Router } from "express";
import * as controller from "../controllers/adminController.js";
import { authenticate } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const adminRouter = Router();
adminRouter.use(authenticate, allowRoles("admin"));
adminRouter.get("/stats", asyncHandler(controller.stats));
adminRouter.get("/users", asyncHandler(controller.users));
adminRouter.post("/users", asyncHandler(controller.createUser));
adminRouter.patch("/users/:id", asyncHandler(controller.updateUser));
adminRouter.get("/exams", asyncHandler(controller.exams));
adminRouter.delete("/exams/:id", asyncHandler(controller.deleteExam));
adminRouter.patch("/submissions/:id/reset", asyncHandler(controller.resetSubmission));
adminRouter.get("/audits", asyncHandler(controller.audits));

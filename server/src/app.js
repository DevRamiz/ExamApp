import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { authRouter } from "./routes/authRoutes.js";
import { examRouter } from "./routes/examRoutes.js";
import { submissionRouter } from "./routes/submissionRoutes.js";
import { dashboardRouter } from "./routes/dashboardRoutes.js";
import { notificationRouter } from "./routes/notificationRoutes.js";
import { monitoringRouter } from "./routes/monitoringRoutes.js";
import { analyticsRouter } from "./routes/analyticsRoutes.js";
import { reportRouter } from "./routes/reportRoutes.js";
import { aiRouter } from "./routes/aiRoutes.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { requestContext } from "./middleware/requestContext.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export const app = express();
if (env.trustProxy) app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.clientOrigin, credentials: false }));
app.use(express.json({ limit: "1mb" }));
app.use(requestContext);
app.use(rateLimit({ windowMs: 60_000, max: 240, keyPrefix: "api" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "examflow-api", architecture: "modular-core-with-ai-and-report-microservices" }));
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/exams", examRouter);
app.use("/api/submissions", submissionRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/monitoring", monitoringRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/reports", reportRouter);
app.use("/api/ai", aiRouter);
app.use("/api/admin", adminRouter);

const publicDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../public");
if (fs.existsSync(publicDirectory)) {
  app.use(express.static(publicDirectory));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api") && req.accepts("html")) {
      return res.sendFile(path.join(publicDirectory, "index.html"));
    }
    next();
  });
}

app.use(notFound);
app.use(errorHandler);

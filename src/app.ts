import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";

import healthRoutes from "./routes/health.routes";
import streamRoutes from "./routes/stream.routes";
import resumeRoutes from "./routes/resume.routes";
import authRoutes from "./routes/auth.routes";
import jobDescriptionRoutes from "./routes/jobDescription.routes";
import analysisRoutes from "./routes/analysis.routes";
import jobImportRoutes from "./routes/jobImport.routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

const allowedOrigins = env.allowedOrigins.split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());

app.use("/api/health", healthRoutes);

app.use("/api/stream", streamRoutes);

app.use("/api/resumes", resumeRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/job-descriptions", jobDescriptionRoutes);

app.use("/api/analyses", analysisRoutes);

app.use("/api/job", jobImportRoutes);

app.use(errorHandler);

export default app;

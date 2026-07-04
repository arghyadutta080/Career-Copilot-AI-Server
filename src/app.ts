import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import healthRoutes from "./routes/health.routes";

const app = express();

app.use(cors());

app.use(express.json());

app.use(cookieParser());

app.use("/api/health", healthRoutes);

export default app;

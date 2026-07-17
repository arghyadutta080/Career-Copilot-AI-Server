import { Router } from "express";
import { importJob } from "../job-import/jobImport.controller";
import { auth } from "../middlewares/auth";

const router = Router();

// Route to import a job from URL
router.post("/import", auth, importJob);

export default router;

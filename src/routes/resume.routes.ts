import { Router } from "express";
import { upload } from "../config/multer";
import { auth } from "../middlewares/auth";
import { getResume, uploadResume, getAllResumes, deleteResume } from "../controllers/resume.controller";

const router = Router();

router.post("/upload", auth, upload.single("resume"), uploadResume);

router.get("/", auth, getAllResumes);

router.get("/:resumeId", auth, getResume);

router.delete("/:resumeId", auth, deleteResume);

export default router;

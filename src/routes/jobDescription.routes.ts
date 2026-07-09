import { Router } from "express";
import { createJobDescription } from "../services/jobDescription.service";
import JobDescription from "../models/JobDescription";
import Analysis from "../models/Analysis";
import { auth } from "../middlewares/auth";

const router = Router();

// Route to create a job description
router.post("/", auth, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const jobDescription = await createJobDescription(userId, req.body);
    return res.status(201).json(jobDescription);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to get all job descriptions of the logged-in user
router.get("/", auth, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const jobs = await JobDescription.find({ userId });
    return res.json(jobs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to get a specific job description by ID
router.get("/:jobId", auth, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.params;
    const jobDescription = await JobDescription.findOne({ _id: jobId, userId });
    
    if (!jobDescription) {
      return res.status(404).json({ error: "Job description not found" });
    }
    
    return res.json(jobDescription);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to get analyses associated with a job description ID
router.get("/:jobId/analyses", auth, async (req: any, res: any) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.userId;

    const analyses = await Analysis.find(
      { jobDescriptionId: jobId, userId },
      { _id: 1, createdAt: 1, updatedAt: 1 }
    );

    return res.json(analyses);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to delete a job description and its associated analyses
router.delete("/:jobId", auth, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.params;

    const jobDescription = await JobDescription.findOne({ _id: jobId, userId });
    if (!jobDescription) {
      return res.status(404).json({ error: "Job description not found" });
    }

    // Cascade delete analyses referencing this job description
    await Analysis.deleteMany({ jobDescriptionId: jobId, userId });

    // Delete the job description document
    await JobDescription.deleteOne({ _id: jobId, userId });

    return res.json({ success: true, message: "Job description deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

import { Router } from "express";
import { auth } from "../middlewares/auth";
import Analysis from "../models/Analysis";
import JobDescription from "../models/JobDescription";

const router = Router();

// Route to get dashboard overview of job descriptions and analyses
router.get("/dashboard", auth, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;

    // Fetch all job descriptions for this user
    const jobDescriptions = await JobDescription.find({ userId });
    
    // Fetch all analyses for this user
    const analyses = await Analysis.find({ userId });

    // Map analyses to their job description
    const dashboardData = analyses.map((analysis) => {
      const jobDesc = jobDescriptions.find(
        (job) => job._id.toString() === analysis.jobDescriptionId.toString()
      );
      
      const analysisObj = analysis.toObject() as any;
      analysisObj.id = analysisObj._id.toString();

      return {
        jobDescription: jobDesc || null,
        analysis: analysisObj,
      };
    });

    // Sort by analysis creation date descending
    dashboardData.sort((a, b) => {
      const dateA = new Date(a.analysis.createdAt).getTime();
      const dateB = new Date(b.analysis.createdAt).getTime();
      return dateB - dateA;
    });

    return res.json(dashboardData);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to delete a specific analysis by ID
router.delete("/:analysisId", auth, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { analysisId } = req.params;

    const analysis = await Analysis.findOneAndDelete({ _id: analysisId, userId });
    
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    return res.json({ success: true, message: "Analysis deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

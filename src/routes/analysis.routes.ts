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

    // Map analyses to their job description and prune the analysis fields to match GetAnalysisOverview GraphQL schema
    const dashboardData = analyses.map((analysis) => {
      const jobDesc = jobDescriptions.find(
        (job) => job._id.toString() === analysis.jobDescriptionId.toString()
      );
      
      const prunedAnalysis = {
        id: analysis._id.toString(),
        userId: analysis.userId,
        resumeId: analysis.resumeId,
        jobDescriptionId: analysis.jobDescriptionId,
        status: analysis.status,
        createdAt: new Date(analysis.createdAt).getTime().toString(),
        updatedAt: new Date(analysis.updatedAt).getTime().toString(),
        toolStatus: {
          ats: analysis.toolStatus?.ats || "not_started",
          skillGap: analysis.toolStatus?.skillGap || "not_started",
          optimizer: analysis.toolStatus?.optimizer || "not_started",
          coverLetter: analysis.toolStatus?.coverLetter || "not_started",
          interview: analysis.toolStatus?.interview || "not_started",
          roadmap: analysis.toolStatus?.roadmap || "not_started",
        },
        results: {
          ats: {
            score: analysis.results?.ats?.score,
            strengths: analysis.results?.ats?.strengths || [],
            weaknesses: analysis.results?.ats?.weaknesses || [],
          },
          roadmap: {
            overview: analysis.results?.roadmap?.overview || "",
          },
        },
      };

      return {
        jobDescription: jobDesc || null,
        analysis: prunedAnalysis,
      };
    });

    // Sort by analysis creation date descending using UNIX timestamps
    dashboardData.sort((a, b) => {
      const dateA = parseInt(a.analysis.createdAt, 10);
      const dateB = parseInt(b.analysis.createdAt, 10);
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

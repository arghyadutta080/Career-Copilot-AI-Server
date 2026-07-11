import { Router } from "express";
import { auth } from "../middlewares/auth";
import Analysis from "../models/Analysis";
import Resume from "../models/Resume";
import JobDescription from "../models/JobDescription";
import {
  createAnalysis,
  generateInterviewQuestions,
  generateLearningRoadmap,
  startAnalysis,
} from "../analysis/services/analysis.service";
import { generateAnswerAsyncTask } from "../analysis/tools/interview-answer/answer.tool";

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

// Route to create a new analysis
router.post("/", auth, async (req: any, res: any) => {
  try {
    const { resumeId, jobDescriptionId } = req.body;
    const analysis = await createAnalysis(req.user.userId, resumeId, jobDescriptionId);
    
    // Return pruned output to match what frontend expects
    return res.status(201).json({
      id: analysis._id.toString(),
      status: analysis.status,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to start the analysis pipeline
router.post("/:analysisId/start", auth, async (req: any, res: any) => {
  try {
    const { analysisId } = req.params;
    
    // Verify ownership
    const analysis = await Analysis.findOne({ _id: analysisId, userId: req.user.userId });
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    void startAnalysis(analysisId);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to generate interview questions
router.post("/:analysisId/interview", auth, async (req: any, res: any) => {
  try {
    const { analysisId } = req.params;

    // Verify ownership
    const analysis = await Analysis.findOne({ _id: analysisId, userId: req.user.userId });
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    void generateInterviewQuestions(analysisId);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to generate learning roadmap
router.post("/:analysisId/roadmap", auth, async (req: any, res: any) => {
  try {
    const { analysisId } = req.params;

    // Verify ownership
    const analysis = await Analysis.findOne({ _id: analysisId, userId: req.user.userId });
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    void generateLearningRoadmap(analysisId);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to generate answer for a specific interview question
router.post("/:analysisId/questions/:questionId/answer", auth, async (req: any, res: any) => {
  try {
    const { analysisId, questionId } = req.params;

    const analysis = await Analysis.findOne({ _id: analysisId, userId: req.user.userId });
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    const resume = await Resume.findById(analysis.resumeId);
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const jobDesc = await JobDescription.findById(analysis.jobDescriptionId);
    const jobDescriptionText = jobDesc?.description || "";

    const categories = ["hr", "resumeBased", "experienceBased", "projectBased", "technical", "coding", "behavioral"];
    let targetQuestion: any = null;
    let foundCategory: string = "";

    for (const cat of categories) {
      const list = (analysis.results?.interview as any)?.[cat];
      if (list && Array.isArray(list)) {
        const q = list.find((item: any) => item.id === questionId);
        if (q) {
          targetQuestion = q;
          foundCategory = cat;
          break;
        }
      }
    }

    if (!targetQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    if (targetQuestion.answer?.status === "generating") {
      return res.json({ success: false, message: "Already generating" });
    }

    // Mark status as generating in MongoDB
    await Analysis.updateOne(
      { _id: analysisId, [`results.interview.${foundCategory}.id`]: questionId },
      { $set: { [`results.interview.${foundCategory}.$.answer.status`]: "generating" } }
    );

    // Trigger task asynchronously
    void generateAnswerAsyncTask(
      analysisId,
      questionId,
      foundCategory,
      targetQuestion.question,
      targetQuestion.difficulty || "Medium",
      resume.parsedData,
      jobDescriptionText
    );

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

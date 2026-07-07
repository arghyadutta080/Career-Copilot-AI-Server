// import { sendEvent } from "../../stream/sseManager";
import Analysis from "../../models/Analysis";
import Resume from "../../models/Resume";
import JobDescription from "../../models/JobDescription";
import { AnalysisState } from "../pipeline/pipeline.types";
import { AnalysisPipeline } from "../pipeline/analysis.pipeline";
import { InterviewTool } from "../tools/interview/interview.tool";
import { RoadmapTool } from "../tools/roadmap/roadmap.tool";
import { buildAnalysisState } from "../utils/buildAnalysisState";

// function sleep(ms: number): Promise<void> {
//   return new Promise((resolve) => {
//     setTimeout(resolve, ms);
//   });
// }

// export const fakeAnalysis = async (analysisId: string) => {
//   sendEvent(analysisId, {
//     type: "progress",
//     step: "resume",
//     message: "Parsing Resume",
//     progress: 20,
//   });

//   await sleep(2000);

//   sendEvent(analysisId, {
//     type: "progress",
//     step: "ats",
//     message: "Calculating ATS",
//     progress: 50,
//   });

//   await sleep(2000);

//   sendEvent(analysisId, {
//     type: "progress",
//     step: "interview",
//     message: "Generating Questions",
//     progress: 80,
//   });

//   await sleep(2000);

//   sendEvent(analysisId, {
//     type: "complete",
//     step: "done",
//     message: "Completed",
//     progress: 100,
//   });
// };

export async function createAnalysis(
  userId: string,
  resumeId: string,
  jobDescriptionId: string,
) {
  const resume = await Resume.findOne({
    _id: resumeId,
    userId,
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  const job = await JobDescription.findOne({
    _id: jobDescriptionId,
    userId,
  });

  if (!job) {
    throw new Error("Job description not found");
  }

  const analysis = await Analysis.create({
    userId,
    resumeId,
    jobDescriptionId,
    status: "pending",
    toolStatus: {
      ats: "not_started",
      skillGap: "not_started",
      optimizer: "not_started",
      coverLetter: "not_started",
      interview: "not_started",
      roadmap: "not_started",
    },
  });

  return analysis;
}

export async function startAnalysis(analysisId: string) {
  const analysis = await Analysis.findById(analysisId);

  const resume = await Resume.findById(analysis?.resumeId);

  const job = await JobDescription.findById(analysis?.jobDescriptionId);

  if (!analysis || !resume || !job) {
    throw new Error("Analysis not found");
  }

  const state: AnalysisState = {
    analysisId: analysis.id,
    resumeId: resume._id.toString(),
    jobDescriptionId: job._id.toString(),
    rawResume: resume.rawText || "",
    parsedResume: resume.parsedData,
    jobDescription: job.description,
    jobTitle: job.title,
    company: job.company,
  };

  const pipeline = new AnalysisPipeline();

  await pipeline.execute(state);
}

export async function generateInterviewQuestions(analysisId: string) {
  const state = await buildAnalysisState(analysisId);

  const interviewTool = new InterviewTool();
  await interviewTool.execute(state);
}

export async function generateLearningRoadmap(analysisId: string) {
  const state = await buildAnalysisState(analysisId);

  if (state?.toolStatus?.interview !== "completed") {
    throw new Error("Interview question generation is not completed");
  }

  const roadmapTool = new RoadmapTool();
  await roadmapTool.execute(state);
}

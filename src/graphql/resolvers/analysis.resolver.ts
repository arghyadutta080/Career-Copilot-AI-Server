import {
  createAnalysis,
  generateInterviewQuestions,
  generateLearningRoadmap,
  startAnalysis,
} from "../../analysis/services/analysis.service";
import Analysis from "../../models/Analysis";
import Resume from "../../models/Resume";
import JobDescription from "../../models/JobDescription";
import { generateAnswerAsyncTask } from "../../analysis/tools/interview-answer/answer.tool";

export const analysisResolver = {
  Query: {
    getAnalysis: async (_: any, { id }: any) => {
      return await Analysis.findById(id);
    },
  },

  Mutation: {
    createAnalysis: async (_: any, args: any, ctx: any) => {
      return await createAnalysis(
        ctx.user.userId,
        args.resumeId,
        args.jobDescriptionId,
      );
    },

    startAnalysis: async (_: any, { analysisId }: any) => {
      void startAnalysis(analysisId);

      return true;
    },

    generateInterviewQuestions: async (_: any, { analysisId }: any) => {
      void generateInterviewQuestions(analysisId);

      return true;
    },

    generateLearningRoadmap: async (_: any, { analysisId }: any) => {
      void generateLearningRoadmap(analysisId);

      return true;
    },

    generateInterviewAnswer: async (_: any, { analysisId, questionId }: any, ctx: any) => {
      if (!ctx.user || !ctx.user.userId) {
        throw new Error("Unauthorized");
      }

      const analysis = await Analysis.findById(analysisId);
      if (!analysis) {
        throw new Error("Analysis not found");
      }

      if (analysis.userId.toString() !== ctx.user.userId) {
        throw new Error("Unauthorized");
      }

      const resume = await Resume.findById(analysis.resumeId);
      if (!resume) {
        throw new Error("Resume not found");
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
        throw new Error("Question not found");
      }

      if (targetQuestion.answer?.status === "generating") {
        return false;
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

      return true;
    },
  },
};

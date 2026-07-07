import {
  createAnalysis,
  generateInterviewQuestions,
  generateLearningRoadmap,
  startAnalysis,
} from "../../analysis/services/analysis.service";
import Analysis from "../../models/Analysis";

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
  },
};

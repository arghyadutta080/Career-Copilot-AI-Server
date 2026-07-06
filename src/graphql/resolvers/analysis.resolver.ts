import {
  createAnalysis,
  startAnalysis,
} from "../../analysis/services/analysis.service";
import { createJobDescription } from "../../services/jobDescription.service";
import Analysis from "../../models/Analysis";
import JobDescription from "../../models/JobDescription";

export const analysisResolver = {
  Query: {
    myJobDescriptions: async (_: any, __: any, ctx: any) => {
      return await JobDescription.find({
        userId: ctx.user.userId,
      });
    },

    getAnalysis: async (_: any, { id }: any) => {
      return await Analysis.findById(id);
    },
  },

  Mutation: {
    createJobDescription: async (_: any, args: any, ctx: any) => {
      return await createJobDescription(
        ctx.user.userId,
        args,
      );
    },

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
  },
};

import Analysis from "../../models/Analysis";

export const analysisResolver = {
  Query: {
    getAnalysis: async (_: any, { id }: any) => {
      return await Analysis.findById(id);
    },
  },
};

import { analysisResolver } from "./analysis.resolver";

export const resolvers = {
  Query: {
    ...analysisResolver.Query,
  },

  Mutation: {
    ...analysisResolver.Mutation,
  },
};

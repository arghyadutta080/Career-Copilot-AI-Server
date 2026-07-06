import { authResolver } from "./auth.resolver";
import { analysisResolver } from "./analysis.resolver";

export const resolvers = {
  Query: {
    ...authResolver.Query,
    ...analysisResolver.Query,
  },

  Mutation: {
    ...authResolver.Mutation,
    ...analysisResolver.Mutation,
  },
};

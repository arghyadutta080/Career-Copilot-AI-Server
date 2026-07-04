import { authResolver } from "./auth.resolver";

export const resolvers = {
  Query: {
    ...authResolver.Query,
  },

  Mutation: {
    ...authResolver.Mutation,
  },
};

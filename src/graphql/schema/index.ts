import { mergeTypeDefs } from "@graphql-tools/merge";

import { authTypeDefs } from "./auth.schema";
import { userTypeDefs } from "./user.schema";
import { analysisTypeDefs } from "./analysis.schema";

export const typeDefs = mergeTypeDefs([
  userTypeDefs,
  authTypeDefs,
  analysisTypeDefs,
]);

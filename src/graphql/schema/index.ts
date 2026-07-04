import { mergeTypeDefs } from "@graphql-tools/merge";

import { authTypeDefs } from "./auth.schema";

import { userTypeDefs } from "./user.schema";

export const typeDefs = mergeTypeDefs([userTypeDefs, authTypeDefs]);

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { context } from "./context";

export const setupGraphQL = async (app: any) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    "/graphql",

    expressMiddleware(server, {
      context,
    }),
  );
};

import app from "../src/app";
import { connectDB } from "../src/config/db";
import { setupGraphQL } from "../src/graphql";

let isInitialized = false;

const initServer = async () => {
  if (!isInitialized) {
    await connectDB();
    await setupGraphQL(app);
    isInitialized = true;
  }
};

export default async function handler(req: any, res: any) {
  await initServer();
  return app(req, res);
}

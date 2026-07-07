import "../src/config/polyfills";
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
  try {
    await initServer();
    return app(req, res);
  } catch (error: any) {
    console.error("[Vercel Handler Error]:", error);
    return res.status(500).json({
      error: error.message || "Serverless Function Crash",
      stack: error.stack,
    });
  }
}

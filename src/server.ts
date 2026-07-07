import "./config/polyfills";
import app from "./app";
import { connectDB } from "./config/db";
import { setupGraphQL } from "./graphql";
// import { testAI } from "./services/testAI.service";

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();
  await setupGraphQL(app);
  // await testAI();

  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

bootstrap();

// Global process error handlers to prevent crashes from unhandled async/sync exceptions
process.on("unhandledRejection", (reason, promise) => {
  console.error("[Process Error] Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[Process Error] Uncaught Exception thrown:", error);
});

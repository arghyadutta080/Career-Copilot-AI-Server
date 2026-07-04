import app from "./app";
import { connectDB } from "./config/db";
import { setupGraphQL } from "./graphql";

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();
  await setupGraphQL(app);

  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

bootstrap();

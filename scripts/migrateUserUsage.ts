/**
 * ONE-TIME MIGRATION SCRIPT
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeds the `userusages` collection for all existing users.
 *
 * For each user this script will:
 *   - Count how many analyses they already created
 *   - Collect the corresponding analysis ObjectIds
 *   - Set createdAt = their earliest analysis.createdAt (falls back to user.createdAt)
 *   - Set updatedAt = their latest  analysis.updatedAt (falls back to createdAt)
 *   - Assign plan = "FREE" (can be manually upgraded in MongoDB afterwards)
 *
 * The insert uses the raw MongoDB driver (collection.insertOne) to bypass
 * Mongoose's automatic timestamp management, so the historical dates are
 * preserved exactly as they exist in the Analysis collection.
 *
 * Safe to re-run: acts as an upsert, ensuring all counts are accurate.
 * If a UserUsage document already exists, its `plan` is preserved, while
 * `analysisCreated` and `createdAnalysisIds` are recalculated from the DB.
 *
 * Run:
 *   npx ts-node scripts/migrateUserUsage.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../src/models/User";
import Analysis from "../src/models/Analysis";

const MONGO_URI = process.env.MONGO_URI || "";

async function migrate() {
  if (!MONGO_URI) {
    console.error("❌  MONGO_URI is not set. Make sure .env is present.");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected to MongoDB\n");

  // Use the raw collection to bypass Mongoose's auto-timestamp behaviour
  const usageCollection = mongoose.connection.collection("userusages");

  const users = await User.find({}).lean();
  console.log(`👥  Found ${users.length} user(s)\n`);

  let upserted = 0;
  let errors = 0;

  for (const user of users) {
    const userId = user._id as mongoose.Types.ObjectId;

    try {
      // ── Fetch existing to preserve plan if present ───────────────────────
      const existing = await usageCollection.findOne({ userId });

      // ── Fetch all analyses for this user, oldest first ───────────────────
      const analyses = await Analysis.find({ userId })
        .sort({ createdAt: 1 })
        .lean();

      const analysisCount = analyses.length;
      const analysisIds = analyses.map((a) => a._id as mongoose.Types.ObjectId);

      // ── Determine timestamps ──────────────────────────────────────────────
      // createdAt → earliest analysis.createdAt (or user.createdAt as fallback)
      const createdAt: Date =
        analysisCount > 0
          ? (analyses[0].createdAt as Date)
          : (user.createdAt as Date);

      // updatedAt → latest analysis.updatedAt across all analyses
      const updatedAt: Date =
        analysisCount > 0
          ? analyses.reduce<Date>((latest, a) => {
              const t = a.updatedAt as Date;
              return t > latest ? t : latest;
            }, analyses[0].updatedAt as Date)
          : createdAt;

      // ── Upsert via raw driver (preserves custom timestamps) ───────────────
      await usageCollection.updateOne(
        { userId },
        {
          $set: {
            plan: existing?.plan || "FREE",
            analysisCreated: analysisCount,
            createdAnalysisIds: analysisIds,
            updatedAt,
          },
          $setOnInsert: {
            createdAt,
          },
        },
        { upsert: true }
      );

      console.log(
        `✅  Upserted ${user.email}  →  ${analysisCount} analysis(es)` +
          `  [createdAt: ${createdAt.toISOString()}]`
      );
      upserted++;
    } catch (err) {
      console.error(`❌  Error processing ${user.email}:`, err);
      errors++;
    }
  }

  console.log("\n─────────────────────────────────────────────");
  console.log(`✅  Upserted: ${upserted}`);
  console.log(`❌  Errors  : ${errors}`);
  console.log("─────────────────────────────────────────────\n");

  await mongoose.disconnect();
  console.log("🔌  Disconnected from MongoDB");
  process.exit(errors > 0 ? 1 : 0);
}

migrate().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

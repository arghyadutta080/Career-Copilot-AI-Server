import mongoose from "mongoose";
import UserUsage from "../models/UserUsage";
import { PLAN_LIMITS, Plan } from "../config/env";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UsageSummary {
  plan: Plan;
  analysisCreated: number;
  analysisLimit: number;
  remainingAnalysis: number;
}

export interface QuotaCheckResult {
  allowed: boolean;
  used: number;
  remaining: number;
  limit: number;
  plan: Plan;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Find or create the singleton UserUsage document for the given user.
 * Defaults to FREE plan with 0 analyses created.
 */
export async function getOrCreateUsage(userId: string) {
  const usage = await UserUsage.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    {
      $setOnInsert: {
        userId: new mongoose.Types.ObjectId(userId),
        plan: "FREE",
        analysisCreated: 0,
        createdAnalysisIds: [],
      },
    },
    { upsert: true, new: true },
  );
  return usage;
}

/**
 * Check whether the user is allowed to create a new analysis.
 * Reads plan limits from PLAN_LIMITS (env vars) — never from MongoDB.
 *
 * Throws an Error with the user-facing message if the quota is exceeded.
 * Returns a QuotaCheckResult if the user is within limits.
 */
export async function canCreateAnalysis(userId: string): Promise<QuotaCheckResult> {
  const usage = await getOrCreateUsage(userId);
  const plan = usage.plan as Plan;
  const limit = PLAN_LIMITS[plan];
  const used = usage.analysisCreated;
  const remaining = Math.max(0, limit - used);

  if (used >= limit) {
    throw new Error(
      "You have reached your analysis limit. Contact the developer to upgrade your account.",
    );
  }

  return { allowed: true, used, remaining, limit, plan };
}

/**
 * Record that an analysis was successfully created for this user.
 * Increments analysisCreated and pushes the analysisId into createdAnalysisIds.
 * Quota is lifetime — this is never decremented.
 */
export async function recordAnalysisCreated(
  userId: string,
  analysisId: string,
): Promise<void> {
  await UserUsage.updateOne(
    { userId: new mongoose.Types.ObjectId(userId) },
    {
      $inc: { analysisCreated: 1 },
      $push: { createdAnalysisIds: new mongoose.Types.ObjectId(analysisId) },
    },
  );
}

/**
 * Return a public summary of the user's current usage and quota.
 */
export async function getUsage(userId: string): Promise<UsageSummary> {
  const usage = await getOrCreateUsage(userId);
  const plan = usage.plan as Plan;
  const limit = PLAN_LIMITS[plan];
  const used = usage.analysisCreated;
  const remaining = Math.max(0, limit - used);

  return {
    plan,
    analysisCreated: used,
    analysisLimit: limit,
    remainingAnalysis: remaining,
  };
}

/**
 * Upgrade (or change) a user's plan.
 * Only updates the plan field — limits are always derived from env vars.
 * Intended to be used manually via MongoDB or a future admin route.
 */
export async function upgradePlan(userId: string, plan: Plan): Promise<void> {
  await UserUsage.updateOne(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $set: { plan } },
    { upsert: true },
  );
}

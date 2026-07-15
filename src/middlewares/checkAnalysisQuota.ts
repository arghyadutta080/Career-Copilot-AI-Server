import { Request, Response, NextFunction } from "express";
import { canCreateAnalysis } from "../services/usage.service";

/**
 * Express middleware that enforces the per-plan lifetime analysis quota.
 * Must be placed after the `auth` middleware so that `req.user` is available.
 *
 * If the user is within quota, execution continues to the next handler.
 * If the quota is exceeded, a 403 response is returned immediately with
 * a human-readable error message and a machine-readable error code so the
 * frontend can distinguish this specific failure from generic errors.
 */
export async function checkAnalysisQuota(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await canCreateAnalysis(userId);
    next();
  } catch (err: any) {
    res.status(403).json({
      error: err.message,
      code: "FREE_LIMIT_REACHED",
    });
  }
}

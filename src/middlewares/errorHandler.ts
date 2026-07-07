import { Request, Response, NextFunction } from "express";

/**
 * Global error-handling middleware for Express
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the complete error stack trace
  console.error("[Global Error Handler]:", err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "An unexpected error occurred on the server.";

  // Respond with a structured error payload
  return res.status(status).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
}

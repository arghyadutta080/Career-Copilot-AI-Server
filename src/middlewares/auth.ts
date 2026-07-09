import jwt from "jsonwebtoken";
import { env } from "../config/env";
import BlacklistedToken from "../models/BlacklistedToken";

export async function auth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.sendStatus(401);

  try {
    // Check if token is blacklisted
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      return res.sendStatus(401);
    }

    req.user = jwt.verify(token, env.jwtSecret);
    req.token = token;
    console.log("[Auth Middleware] Verified User\n:", req.user);

    next();
  } catch {
    return res.sendStatus(401);
  }
}


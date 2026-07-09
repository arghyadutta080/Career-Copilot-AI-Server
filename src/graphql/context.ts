import jwt from "jsonwebtoken";
import { env } from "../config/env";
import BlacklistedToken from "../models/BlacklistedToken";

export const context = async ({ req }: any) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token)
    return {
      user: null,
    };

  try {
    // Check if token is blacklisted
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      return {
        user: null,
      };
    }

    const decoded = jwt.verify(token, env.jwtSecret);

    return {
      user: decoded,
    };
  } catch {
    return {
      user: null,
    };
  }
};


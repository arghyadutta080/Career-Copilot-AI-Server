import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const context = async ({ req }: any) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token)
    return {
      user: null,
    };

  try {
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

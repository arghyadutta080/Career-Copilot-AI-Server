import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function auth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.sendStatus(401);

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    console.log("[TESTING AUTH : ", req.user);

    next();
  } catch {
    return res.sendStatus(401);
  }
}

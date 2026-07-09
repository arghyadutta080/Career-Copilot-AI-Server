import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { findOrCreateUser, getMe, updateProfile } from "../services/auth.service";
import { generateToken } from "../utils/jwt";
import { env } from "../config/env";
import { auth } from "../middlewares/auth";
import BlacklistedToken from "../models/BlacklistedToken";
import jwt from "jsonwebtoken";

const router = Router();
const client = new OAuth2Client(env.googleClientId);

router.post("/google", async (req: any, res: any) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: env.googleClientId,
    });

    const payload = ticket.getPayload();

    const user = await findOrCreateUser({
      googleId: payload?.sub,
      email: payload?.email,
      name: payload?.name,
      avatar: payload?.picture,
    });

    const jwtToken = generateToken(user.id);

    return res.json({
      token: jwtToken,
      user,
    });
  } catch (error: any) {
    console.error("Google auth error:", error);
    return res.status(500).json({ error: error.message });
  }
});

router.get("/me", auth, async (req: any, res: any) => {
  try {
    const user = await getMe(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.put("/me", auth, async (req: any, res: any) => {
  try {
    const user = await updateProfile(req.user.userId, req.body);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/logout", auth, async (req: any, res: any) => {
  try {
    const token = req.token;
    if (!token) {
      return res.status(400).json({ error: "No token to logout" });
    }

    let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days fallback
    if (req.user && req.user.exp) {
      expiresAt = new Date(req.user.exp * 1000);
    } else {
      try {
        const decoded: any = jwt.decode(token);
        if (decoded && decoded.exp) {
          expiresAt = new Date(decoded.exp * 1000);
        }
      } catch (err) {
        console.error("[Auth Routes] Error decoding token for expiration:", err);
      }
    }

    // Upsert token in blacklist to prevent duplicate key errors on double logouts
    await BlacklistedToken.updateOne(
      { token },
      { $setOnInsert: { token, expiresAt } },
      { upsert: true }
    );

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

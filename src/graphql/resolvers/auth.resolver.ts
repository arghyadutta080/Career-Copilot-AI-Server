import { OAuth2Client } from "google-auth-library";

import { generateToken } from "../../utils/jwt";

import { findOrCreateUser, getMe } from "../../services/auth.service";
import { env } from "../../config/env";

const client = new OAuth2Client(env.googleClientId);

export const authResolver = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      console.log("[TESTING]: context", context);
      const user = await getMe(context.user.userId);
      console.log("[TESTING]: user", user);
      return user;
    },
  },

  Mutation: {
    googleAuth: async (_: any, { token }: any) => {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: env.googleClientId,
      });
      console.log("[TESTING]: ticket", ticket);

      const payload = ticket.getPayload();
      console.log("[TESTING]: payload", payload);

      const user = await findOrCreateUser({
        googleId: payload?.sub,
        email: payload?.email,
        name: payload?.name,
        avatar: payload?.picture,
      });
      console.log("[TESTING]: user", user);

      return {
        token: generateToken(user.id),
        user,
      };
    },
  },
};

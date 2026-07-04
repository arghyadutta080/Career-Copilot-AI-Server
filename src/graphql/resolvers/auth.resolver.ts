import { OAuth2Client } from "google-auth-library";

import { generateToken } from "../../utils/jwt";

import { findOrCreateUser } from "../../services/auth.service";
import { env } from "../../config/env";

const client = new OAuth2Client(env.googleClientId);

export const authResolver = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      return context.user;
    },
  },

  Mutation: {
    googleAuth: async (_: any, { token }: any) => {
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

      return {
        token: generateToken(user.id),
        user,
      };
    },
  },
};

import User from "../models/User";

export const findOrCreateUser = async (profile: any) => {
  let user = await User.findOne({ email: profile.email });

  if (user) return user;

  user = await User.create({
    googleId: profile.googleId,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar,
  });

  return user;
};

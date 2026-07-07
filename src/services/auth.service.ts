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

export const getMe = async (id: string) => {
  console.log("[TESTING]: id", id);
  const user = await User.findById(id);
  return user;
};

export const updateProfile = async (id: string, updateData: any) => {
  const { googleId, email, ...allowedUpdates } = updateData;

  const user = await User.findById(id);
  if (!user) return null;

  if (allowedUpdates.preferences) {
    const currentPrefs = user.preferences && typeof (user.preferences as any).toObject === "function"
      ? (user.preferences as any).toObject()
      : user.preferences || {};

    user.preferences = {
      ...currentPrefs,
      ...allowedUpdates.preferences,
    };
    delete allowedUpdates.preferences;
  }

  Object.assign(user, allowedUpdates);
  await user.save();
  return user;
};

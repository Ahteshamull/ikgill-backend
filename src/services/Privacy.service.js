import User from "../models/User.js";

export const updatePrivacyService = async (userId, privacyData) => {

  // Get current privacy settings
  const user = await User.findById(userId).select("privacy");
  if (!user) throw new Error("User not found");
  if (user.disabled) throw new Error("Account has disabled");

  // Merge existing privacy with incoming data
  const updatedPrivacy = { ...user.privacy.toObject(), ...privacyData };

  // Update in DB
  user.privacy = updatedPrivacy;
  await user.save();

  return user.privacy;
};
export const getPrivacyService = async (userId) => {
  const user = await User.findById(userId).select("privacy");
  if (!user) throw new Error("User not found");
  if (user.disabled) throw new Error("Account has disabled");
  return user.privacy;
};
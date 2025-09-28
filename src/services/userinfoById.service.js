import User from "../models/User.js";
import Item from "../models/Item.js";
import Outfit from "../models/Outfit.js";
import { Lookbook } from "../models/Lookbook.js";

/**
 * Get all user info including items, outfits, lookbooks, followers, following
 */
export const getUserAllInfoService = async (userId, options = {}) => {
  // Fetch user basic info
  const user = await User.findById(userId)
    .select("-password") // exclude sensitive data
    .lean();

  if (!user) throw new Error("User not found");

  

  return {
    user
  };
};

/**
 * Get user items
 */
export const getUserItemsService = async (userId) => {
  return await Item.find({ user: userId }).lean();
};

/**
 * Get user outfits
 */
export const getUserOutfitsService = async (userId) => {
  return await Outfit.find({ user: userId }).lean();
};

/**
 * Get user lookbooks
 */
export const getUserLookbooksService = async (userId) => {
  return await Lookbook.find({ user: userId }).lean();
};

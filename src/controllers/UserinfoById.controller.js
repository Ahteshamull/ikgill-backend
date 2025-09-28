import {
  getUserAllInfoService,
  getUserItemsService,
  getUserOutfitsService,
  getUserLookbooksService
} from "../services/userinfoById.service.js";

/**
 * Get all user info including items, outfits, lookbooks, followers, following
 */
export const getUserAllInfoController = async (req, res) => {
  try {
    const { userId } = req.params; // pass userId in params

    const data = await getUserAllInfoService(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Get user items only
 */
export const getUserItemsController = async (req, res) => {
  try {
    const { userId } = req.params;

    const items = await getUserItemsService(userId);
    res.status(200).json({ success: true, items });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Get user outfits only
 */
export const getUserOutfitsController = async (req, res) => {
  try {
    const { userId } = req.params;

    const outfits = await getUserOutfitsService(userId);
    res.status(200).json({ success: true, outfits });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Get user lookbooks only
 */
export const getUserLookbooksController = async (req, res) => {
  try {
    const { userId } = req.params;

    const lookbooks = await getUserLookbooksService(userId);
    res.status(200).json({ success: true, lookbooks });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

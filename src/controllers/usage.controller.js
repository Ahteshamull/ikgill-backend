import { getTopOutfits, getUserColorsStats, getWardropUsage } from "../services/usage.service.js";

export const getWardropUsageController = async (req, res) => {
  try {
    const userid= req.headers.user_id;
    const usage = await getWardropUsage({userid});
    res.status(200).json({ success: true, usage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } 
};
export const getMostWarmOutfitsController = async (req, res) => {
  try {
    const userid= req.headers.user_id;
    const outfits = await getTopOutfits(userid);
    res.status(200).json({ success: true, outfits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } 
};



export const getUserColorsStatsController = async (req, res) => {
  try {
    const userid= req.headers.user_id;
    const stats = await getUserColorsStats(userid);
    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
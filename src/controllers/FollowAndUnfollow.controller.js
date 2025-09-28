import { followUser, unfollowUser } from "../services/Follow.service.js";

// Follow controller
export const followUserController = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const userId= req.headers.user_id;
    console.log(targetUserId,userId)
    if (!userId || !targetUserId) {
      return res.status(400).json({ error: "targetUserId are required" });
    }

    const result = await followUser(userId, targetUserId);
    console.log(result)
    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unfollow controller
export const unfollowUserController = async (req, res) => {
  try {
    const {  targetUserId } = req.body;
    const userId= req.headers.user_id;
    if (!userId || !targetUserId) {
      return res.status(400).json({ error: "userId and targetUserId are required" });
    }

    const result = await unfollowUser(userId, targetUserId);
    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

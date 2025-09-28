import { blockUser, unblockUser,getBlockedUsers } from "../services/Blocked.service.js";

// Block controller
export const blockUserController = async (req, res) => {
  try {
    const {  targetUserId } = req.body;
    const userId= req.headers.user_id
    if (!userId || !targetUserId) {
      return res.status(400).json({ error: "userId and targetUserId are required" });
    }

    const result = await blockUser(userId, targetUserId);
    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unblock controller
export const unblockUserController = async (req, res) => {
  try {
    const {  targetUserId } = req.body;
    const userId= req.headers.user_id
    if (!userId || !targetUserId) {
      return res.status(400).json({ error: "userId and targetUserId are required" });
    }

    const result = await unblockUser(userId, targetUserId);
    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getBlockedUsersController = async (req, res) => {
  try {
    const userId= req.headers.user_id

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const blocked = await getBlockedUsers(userId);

    res.status(200).json({ blockedUsers: blocked });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
import {
  getFollowingService,
  getFollowersService,
  getNonConnectedUsersService
} from "../services/MyCommunity.service.js";

// 1. Following users
export const getFollowingController = async (req, res) => {
  try {
    const  userId  = req.headers.user_id;
    const following = await getFollowingService(userId);
    res.status(200).json(following);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Followers users
export const getFollowersController = async (req, res) => {
  try {
    const  userId  = req.headers.user_id;
    const followers = await getFollowersService(userId);
    res.status(200).json(followers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Non-connected users
export const getNonConnectedUsersController = async (req, res) => {
  try {
    const  userId  = req.headers.user_id;
    const nonConnectedUsers = await getNonConnectedUsersService(userId);
    res.status(200).json(nonConnectedUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

import express from "express";
import { followUserController, unfollowUserController } from "../controllers/FollowAndUnfollow.controller.js";
import { authCheck } from "../middlewares/auth.middleware.js";

const  FollowAndUnfollowRoute = express.Router();

// Follow a user
 FollowAndUnfollowRoute.post("/follow",authCheck, followUserController);

// Unfollow a user
 FollowAndUnfollowRoute.post("/unfollow",authCheck, unfollowUserController);

export default FollowAndUnfollowRoute;

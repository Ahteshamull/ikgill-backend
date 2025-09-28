import express from "express";
import {
  getFollowingController,
  getFollowersController,
  getNonConnectedUsersController
} from "../controllers/MyCommunity.controller.js";
import { authCheck } from "../middlewares/auth.middleware.js";

const MyCommunityRoute = express.Router();

// Get only following user info
MyCommunityRoute.get("/following",authCheck, getFollowingController);

// Get only followers user info
MyCommunityRoute.get("/followers",authCheck, getFollowersController);

// Get users who are neither followers nor following
MyCommunityRoute.get("/non-connected",authCheck, getNonConnectedUsersController);

export default MyCommunityRoute;

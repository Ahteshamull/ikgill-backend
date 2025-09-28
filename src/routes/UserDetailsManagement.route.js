import express from "express";
import { getAllUsersController, getUserByIdController, getUserStatsController, ToggleUserStatus } from "../controllers/UserDetailsManagement.controller.js";
import { authCheck } from "../middlewares/auth.middleware.js";
import { authChecks } from "../middlewares/authForAdmin.middleware.js";

const UserDetailsRoute = express.Router();

// GET /api/users → fetch all users
UserDetailsRoute.get("/UserDetails",authChecks, getAllUsersController);
UserDetailsRoute.get("/specificUserDetails/:id",authChecks, getUserByIdController);
UserDetailsRoute.get("/outfitItemLookbookCount/:userId",authChecks, getUserStatsController);
UserDetailsRoute.post("/userStatusToggle",authChecks, ToggleUserStatus);


export default UserDetailsRoute;

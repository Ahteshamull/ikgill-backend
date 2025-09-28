import express from "express";
import { blockUserController, unblockUserController, getBlockedUsersController } from "../controllers/Blocked.controller.js";
import { authCheck } from "../middlewares/auth.middleware.js";

const BlockRoute = express.Router();

BlockRoute.post("/block",authCheck, blockUserController);
BlockRoute.post("/unblock",authCheck, unblockUserController);

// get all blocked users
BlockRoute.get("/AllblockedUser",authCheck, getBlockedUsersController);

export default BlockRoute;

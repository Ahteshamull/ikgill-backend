import express from "express";
import {
  getUserAllInfoController,
  getUserItemsController,
  getUserOutfitsController,
  getUserLookbooksController
} from "../controllers/UserinfoById.controller.js";
import { authCheck } from "../middlewares/auth.middleware.js";
import { authChecks } from "../middlewares/authForAdmin.middleware.js";

const UserInfoRoute = express.Router();

UserInfoRoute.get("/SpecificUser/:userId",authCheck, getUserAllInfoController);
UserInfoRoute.get("/items/:userId",authCheck, getUserItemsController);
UserInfoRoute.get("/outfits/:userId",authCheck, getUserOutfitsController);
UserInfoRoute.get("/lookbooks/:userId",authCheck, getUserLookbooksController);

export default UserInfoRoute;

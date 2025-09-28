import express from "express";

import { authCheck } from "../middlewares/auth.middleware.js"; // your JWT auth middleware  
import e from "cors";
import { getMostWarmOutfitsController, getUserColorsStatsController, getWardropUsageController } from "../controllers/usage.controller.js";
const  usageRoute= express.Router();

usageRoute.get("/getUsageStats", authCheck, getWardropUsageController);
usageRoute.get("/getMostWardOutfits", authCheck, getMostWarmOutfitsController);
usageRoute.get("/getColorCount", authCheck, getUserColorsStatsController);
export default usageRoute;
import express from "express";
import { authCheck } from "../middlewares/auth.middleware.js";
import { getProfile } from "../controllers/profile.controller.js";
import { updateProfile } from "../controllers/profile.controller.js";
import { SingleuploadMiddleware, uploadMiddleware } from "../middlewares/awsUpload.middleware.js";
const profileRoutes = express.Router();



profileRoutes.get("/getProfile", authCheck, getProfile);


profileRoutes.patch("/updateProfile", authCheck,SingleuploadMiddleware, updateProfile);



export default profileRoutes;
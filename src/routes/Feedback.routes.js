import express from "express";
import {
  createFeedbackController,
  getAllFeedbackController,
  getUserFeedbackController,
  deleteFeedbackController,
} from "../controllers/Feedback.controller.js";
import {authCheck} from "../middlewares/auth.middleware.js"
import { authChecks } from "../middlewares/authForAdmin.middleware.js";

const FeedbackRoute = express.Router();

// Routes
FeedbackRoute.post("/createFeedback",authCheck,  createFeedbackController);
FeedbackRoute.get("/GetAllFeedback", authChecks, getAllFeedbackController); // admin can use
FeedbackRoute.get("/GetUserFeedback", authCheck, getUserFeedbackController); // user own feedback
FeedbackRoute.delete("/deleteFeedback/:id", authChecks, deleteFeedbackController);

export default FeedbackRoute;

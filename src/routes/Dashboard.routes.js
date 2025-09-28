import express from "express";
import { getAllStats,getUserActivityController } from "../controllers/Dashboard.controller.js";
import { authChecks } from "../middlewares/authForAdmin.middleware.js";

const Dashboardroute = express.Router();

Dashboardroute.get("/dashboardStats",authChecks, getAllStats);
Dashboardroute.get("/UserActivity/:keyword",authChecks, getUserActivityController);

export default Dashboardroute;

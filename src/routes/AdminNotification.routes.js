import express from "express";

import { authChecks } from "../middlewares/authForAdmin.middleware.js";
import { getAdminNotificationscontroller, markAdminNotificationReadController } from "../controllers/AdminNotification.controller.js";

const AdminNotificationRoute = express.Router();



AdminNotificationRoute.get("/GetAllAdminNotification",authChecks, getAdminNotificationscontroller);
AdminNotificationRoute.patch("/ReadAdminNotification/:id",authChecks, markAdminNotificationReadController);

export default AdminNotificationRoute;

import express from "express";
import { getNotifications, markNotificationRead, deleteNotification } from "../controllers/Notification.controller.js";
import { authCheck } from "../middlewares/auth.middleware.js";

const NotificationRoute = express.Router();



NotificationRoute.get("/GetAllNotification",authCheck, getNotifications);
NotificationRoute.patch("/ReadNotification/:id",authCheck, markNotificationRead);
NotificationRoute.delete("/DeleteNotification/:id",authCheck, deleteNotification);

export default NotificationRoute;

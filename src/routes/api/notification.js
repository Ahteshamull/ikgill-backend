import express from "express";
import {
  listNotifications,
  markNotificationRead,
} from "../../controllers/notification/notification.js";

const router = express.Router();

//localhost:3000/api/v1/notification/notify-list
router.get("/notify-list", listNotifications);
//localhost:3000/api/v1/notification/mark-read/:id
router.patch("/mark-read/:id", markNotificationRead);

export default router;

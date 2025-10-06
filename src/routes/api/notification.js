import express from "express";
import {
  respondToCase,
  listNotifications,
} from "../../controllers/notification/notification.js";

const router = express.Router();
//localhost:3000/api/v1/notification/respond
router.post("/respond", respondToCase); // body: { caseId, action, price }
//localhost:3000/api/v1/notification/notify-list
router.get("/notify-list", listNotifications);

export default router;

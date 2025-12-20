import express from "express";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";
import MessageController from "./message.controller.js";
import { upload } from "../middlewares/imageControlMiddleware.js";

const router = express.Router();

// Helper middleware to parse files & JSON data
const parseFilesMiddleware = (fields) => (req, _res, next) => {
  try {
    if (req.body.data && typeof req.body.data === "string") {
      req.body = JSON.parse(req.body.data);
    }

    next();
  } catch (error) {
    next(new Error("Invalid JSON data"));
  }
};

// New message
router.post(
  "/new_message",
  userAuthMiddleware,
  upload.array("images", 5),
  parseFilesMiddleware(),
  MessageController.new_message
);

// Update message by ID
router.patch(
  "/update_message_by_Id/:messageId",
  userAuthMiddleware,
  MessageController.updateMessageById
);

// Delete message
router.delete(
  "/delete_message/:messageId",
  userAuthMiddleware,
  MessageController.deleteMessageById
);

// Find messages by specific conversation
router.get(
  "/find_by_specific_conversation/:conversationId",
  userAuthMiddleware,
  MessageController.findBySpecificConversation
);

// Send message to specific user
router.post(
  "/send-message/:receiverId",
  userAuthMiddleware,
  upload.array("images", 5),
  parseFilesMiddleware(),
  MessageController.send_message_to_user
);

// Single new message
router.post(
  "/single_new_message",
  userAuthMiddleware,
  upload.array("images", 5),
  parseFilesMiddleware(),
  MessageController.single_new_message
);

const messageRoutes = router;

export default messageRoutes;

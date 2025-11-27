import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import apiError from "../utility/api-error.js";
import MessageController from "./message.controller.js";

const router = express.Router();

// Helper middleware to parse files & JSON data
const parseFilesMiddleware = (fields) => (req, _res, next) => {
  try {
    if (req.body.data && typeof req.body.data === "string") {
      req.body = JSON.parse(req.body.data);
    }

    next();
  } catch (error) {
    next(new apiError(404, "Invalid JSON data", error));
  }
};

// New message
router.post("/new_message", verifyJWT, MessageController.new_message);

// Update message by ID
router.patch(
  "/update_message_by_Id/:messageId",
  verifyJWT,
  MessageController.updateMessageById
);

// Delete message
router.delete(
  "/delete_message/:messageId",
  verifyJWT,
  MessageController.deleteMessageById
);

// Find messages by specific conversation
router.get(
  "/find_by_specific_conversation/:conversationId",
  verifyJWT,
  MessageController.findBySpecificConversation
);

// Single new message
router.post(
  "/single_new_message",
  verifyJWT,
  MessageController.single_new_message
);

const messageRoutes = router;

export default messageRoutes;

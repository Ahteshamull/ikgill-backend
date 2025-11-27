import express from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import ConversationController from "./conversation.controller.js";

const router = express.Router();

// Get user chat list
router.get("/get-chat-list", verifyJWT, ConversationController.getChatList);

// Get all conversations (for events or system-level)
router.get("/allConversation", ConversationController.allConversation);

// Get conversations specific to an event
router.get(
  "/specific_event_wise_conversation/:eventId",
  verifyJWT,
  ConversationController.specificAllGetConversations
);

// Get single (1-to-1) conversations
router.get(
  "/get_single_conversation",
  verifyJWT,
  ConversationController.getSingleConversationList
);

// Get group conversations (if still supported)
router.get(
  "/get_group_conversation/:eventId",
  verifyJWT,
  ConversationController.getGroupConversationList
);

export const conversationRoutes = router;

export default router;

import express from "express";
import userAuthMiddleware from "../../middlewares/userAuthMiddleware.js";
import ConversationController from "../../controllers/message/messageController.js";

const router = express.Router();

//localhost:3000/api/v1/message/get-chat-list
router.get(
  "/get-chat-list",
  userAuthMiddleware,
  ConversationController.getChatList
);

//localhost:3000/api/v1/message/allConversation
router.get("/allConversation", ConversationController.allConversation);

//localhost:3000/api/v1/message/specific_event_wise_conversation/:eventId
router.get(
  "/specific_event_wise_conversation/:eventId",
  userAuthMiddleware,
  ConversationController.specificAllGetConversations
);

//localhost:3000/api/v1/message/get_single_conversation
router.get(
  "/get_single_conversation",
  userAuthMiddleware,
  ConversationController.getSingleConversationList
);

//localhost:3000/api/v1/message/get_group_conversation/:eventId
router.get(
  "/get_group_conversation/:eventId",
  userAuthMiddleware,
  ConversationController.getGroupConversationList
);

export default router;

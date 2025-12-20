import express from "express";
import userAuthMiddleware from "../../middlewares/userAuthMiddleware.js";
import ConversationController from "../../controllers/message/messageController.js";
import MessageController from "../../messages/message.controller.js";
import { upload } from "../../middlewares/imageControlMiddleware.js";

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
// localhost:3000/api/v1/message/find_my_single_chat_list/:conversationId
router.get(
  "/find_my_single_chat_list/:conversationId",
  userAuthMiddleware,
  MessageController.get_my_single_specific_chatList_controller
);

// localhost:3000/api/v1/message/send-message/:receiverId
router.post(
  "/send-message/:receiverId",
  // () => console.log("Sending message"),
  userAuthMiddleware,
  upload.array("images", 5),
  (req, res, next) => {
    if (req.body.data && typeof req.body.data === "string") {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  MessageController.send_message_to_user
);

export default router;

import mongoose from "mongoose";
import ConversationService from "../conversation/conversation.service.js";
import conversations from "../conversation/schema/conversation.model.js";
import MessageService from "../messages/message.service.js";

import { handleSingleSendMessage } from "./chat/handleSingleSendMessage.js";
const handleChatEvents = async (io, socket, currentUserId) => {
  // Join conversation
  socket.on("join-conversation", async (data) => {
    const { conversationId } = data;

    const isExistConversation = await conversations.exists({
      _id: new mongoose.Types.ObjectId(conversationId),
      participants: currentUserId,
    });

    if (!isExistConversation) {
      throw new (404, "Conversation not found");
    }

    const updatedConversation = await conversations.findByIdAndUpdate(
      conversationId,
      { $addToSet: { participants: currentUserId } },
      { new: true }
    );

    if (!updatedConversation) {
      throw new (500, "Failed to add participant");
    }

    console.log("✅ Successfully added new participant:", currentUserId);
  });

  // Get conversation list
  socket.on("get-conversations", async (query) => {
    try {
      console.log({ currentUserId, query });

      // use ConversationService to fetch conversations
      const conversationsList = await ConversationService.getConversation(
        currentUserId,
        query
      );
      socket.emit("conversation-list", conversationsList);
    } catch (err) {
      socket.emit("socket-error", { errorMessage: err.message });
    }
  });

  // Get message page (paginated messages for a conversation)
  socket.on("message-page", async (data) => {
    try {
      const { conversationId, page, limit, sort } = data || {};
      const query = { page, limit, sort };
      const result = await MessageService.findBySpecificConversationInDb(
        conversationId,
        query
      );
      socket.emit("message-page-result", { conversationId, ...result });
    } catch (err) {
      socket.emit("socket-error", { errorMessage: err.message });
    }
  });

  // Typing indicators
  socket.on("typing", ({ conversationId, userId }) => {
    socket.to(conversationId).emit("user-typing", { conversationId, userId });
  });

  socket.on("stop-typing", ({ conversationId, userId }) => {
    socket
      .to(conversationId)
      .emit("user-stop-typing", { conversationId, userId });
  });

  socket.on(
    "single-chat-send-message",
    (data) => handleSingleSendMessage(io, socket, currentUserId, data)
    // handleSingleSendMessage(io, socket, currentUserId, data)
  );
};

export default handleChatEvents;

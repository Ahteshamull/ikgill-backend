import MessageService from "../../messages/message.service.js";

export const handleSingleSendMessage = async (
  io,
  socket,
  currentUserId,
  data
) => {
  try {
    const result = await MessageService.single_new_message_IntoDb(
      { id: currentUserId },
      data
    );

    const conversationId = result && result.data && result.data.conversationId;
    if (conversationId) {
      // Emit the new message to all sockets in the conversation room
      io.to(conversationId.toString()).emit("new-message", result);
    }

    // Acknowledge the sender
    socket.emit("single-message-sent", result);
  } catch (err) {
    const errorPayload = {
      success: false,
      message: err && err.message ? err.message : "Failed to send message",
    };
    socket.emit("socket-error", errorPayload);
  }
};

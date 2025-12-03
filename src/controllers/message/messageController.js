import ConversationService from "../../conversation/messageService.js";

// Get all user conversations
const getChatList = async (req, res) => {
  const result = await ConversationService.getConversation(
    req?.user?.id,
    req.query
  );

  // Send standard HTTP response
  res.status(200).json({
    success: true,
    message: "Conversation retrieved successfully",
    data: result,
  });
};

// Get all conversations for a specific event
const allConversation = async (req, res) => {
  const result = await ConversationService.allConversationIntoDb(
    req.params.eventId,
    req.query
  );

  res.status(200).json({
    success: true,
    message: "Event conversation retrieved successfully",
    data: result,
  });
};

// Get specific conversations by event
const specificAllGetConversations = async (req, res) => {
  const result = await ConversationService.getGroupConversationListIntoDb(
    req.params.eventId,
    req.user?.id,
    req.query
  );

  res.status(200).json({
    success: true,
    message: "Specific event-wise conversation retrieved successfully",
    data: result,
  });
};

// Get all single (1-to-1) conversations for current user
const getSingleConversationList = async (req, res) => {
  const result = await ConversationService.getSingleConversationListIntoDb(
    req.user.id,
    req.query
  );

  res.status(200).json({
    success: true,
    message: "Successfully found my single conversation list",
    data: result,
  });
};

// Get group conversations (if still used)
const getGroupConversationList = async (req, res) => {
  const result = await ConversationService.getGroupConversationListIntoDb(
    req.params.eventId,
    req.user.id,
    req.query
  );

  res.status(200).json({
    success: true,
    message: "Successfully found group conversation list",
    data: result,
  });
};

const ConversationController = {
  getChatList,
  allConversation,
  specificAllGetConversations,
  getSingleConversationList,
  getGroupConversationList,
};

export default ConversationController;

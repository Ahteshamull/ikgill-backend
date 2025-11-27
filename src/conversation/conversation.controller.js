import ConversationService from "./conversation.service.js";

// Get all user conversations
const getChatList = async (req, res) => {
  const result = await ConversationService.getConversation(
    req?.user?.id,
    req.query
  );

  // Send standard HTTP response
  res
    .status(200)
    .json(new apiResponse(200, result, "Conversation retrieved successfully"));
};

// Get all conversations for a specific event
const allConversation = async (req, res) => {
  const result = await ConversationService.allConversationIntoDb(
    req.params.eventId
  );

  res
    .status(200)
    .json(
      new apiResponse(200, result, "Event conversation retrieved successfully")
    );
};

// Get specific conversations by event
const specificAllGetConversations = async (req, res) => {
  const result = await ConversationService.getGroupConversationListIntoDb(
    req.params.eventId,
    req.user?.id,
    req.query
  );

  res
    .status(200)
    .json(
      new apiResponse(
        200,
        result,
        "Specific event-wise conversation retrieved successfully"
      )
    );
};

// Get all single (1-to-1) conversations for current user
const getSingleConversationList = async (req, res) => {
  const result = await ConversationService.getSingleConversationListIntoDb(
    req.user.id,
    req.query
  );

  res
    .status(200)
    .json(
      new apiResponse(
        200,
        result,
        "Successfully found my single conversation list"
      )
    );
};

// Get group conversations (if still used)
const getGroupConversationList = async (req, res) => {
  const result = await ConversationService.getGroupConversationListIntoDb(
    req.params.eventId,
    req.user.id,
    req.query
  );

  res
    .status(200)
    .json(
      new apiResponse(200, result, "Successfully found group conversation list")
    );
};

const ConversationController = {
  getChatList,
  allConversation,
  specificAllGetConversations,
  getSingleConversationList,
  getGroupConversationList,
};

export default ConversationController;

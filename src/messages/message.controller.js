import MessageService from "./message.service.js";

// Create a new message
const new_message = async (req, res) => {
  const result = await MessageService.new_message_IntoDb(
    req.user,
    req.body,
    req.files
  );

  res.json(new (201, result, "Successfully sent the message")());
};

// Update a message by ID
const updateMessageById = async (req, res) => {
  const result = await MessageService.updateMessageById_IntoDb(
    req.params.messageId,
    req.body
  );
  res.status(200).json(new (200, result, "Successfully updated the message")());
};

// Delete a message by ID
const deleteMessageById = async (req, res) => {
  const result = await MessageService.deleteMessageById_IntoDb(
    req.params.messageId
  );
  res.status(200).json(new (200, result, "Successfully deleted the message")());
};

// Find all messages for a specific conversation
const findBySpecificConversation = async (req, res) => {
  const result = await MessageService.findBySpecificConversationInDb(
    req.params.conversationId,
    req.query
  );
  res
    .status(200)
    .json(new 200(), result, "Successfully retrieved all messages");
};

// Send a single (direct) message
const single_new_message = async (req, res) => {
  const result = await MessageService.single_new_message_IntoDb(
    req.user,
    req.body,
    req.files
  );
  res.status(200).json(new (200, result, "Successfully sent the message")());
};

const get_my_single_specific_chatList_controller = async (req, res) => {
  const result = await MessageService.get_my_single_specific_chatList(
    req.params.conversationId,
    req.query
  );

  res.status(200).json({
    success: true,
    message: "Successfully Find My Chat List",
    data: result,
  });
};

const MessageController = {
  new_message,
  updateMessageById,
  deleteMessageById,
  findBySpecificConversation,
  single_new_message,
  get_my_single_specific_chatList_controller,
};

export default MessageController;

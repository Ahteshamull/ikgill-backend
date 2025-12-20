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

// Send message to specific user
const send_message_to_user = async (req, res) => {
  const receiverId = req.params.receiverId;
  const messageData = {
    ...req.body,
    receiverId,
  };

  const result = await MessageService.single_new_message_IntoDb(
    req.user,
    messageData,
    req.files
  );
  res.status(200).json({
    success: true,
    message: "Successfully sent the message",
    data: result,
  });
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
  send_message_to_user,
  single_new_message,
  get_my_single_specific_chatList_controller,
};

export default MessageController;

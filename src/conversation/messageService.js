import mongoose from "mongoose";
import messages from "../messages/schema/message.model.js";
import UserRole from "../models/users/userRoleModal.js";
import conversations from "../models/message/message.js";

/**
 * Get all conversations of a user (with optional search)
 */
const getConversation = async (profileId, query) => {
  const profileObjectId = new mongoose.Types.ObjectId(profileId);
  const searchTerm = query?.searchTerm;

  // Build filter: conversations including the current profile
  const filter = { participants: profileObjectId };

  // If searchTerm is provided, restrict to conversations where the other
  // participant's id matches users/providers whose name matches the term.
  if (searchTerm) {
    const matchingUserRoles = await UserRole.find(
      { name: { $regex: searchTerm, $options: "i" } },
      "_id"
    );
    const matchingUserRoleIds = matchingUserRoles.map((u) => u._id);
    if (matchingUserRoleIds.length > 0) {
      // require that participants include at least one of the matching ids
      filter.$and = [
        { participants: profileObjectId },
        { participants: { $in: matchingUserRoleIds } },
      ];
    }
  }

  // Pagination & fields
  const page = parseInt(query?.page, 10) || 1;
  const limit = parseInt(query?.limit, 10) || 10;
  const skip = (page - 1) * limit;
  let q = conversations
    .find(filter)
    .sort({ updatedAt: -1 })
    .populate("lastMessage");
  if (query?.fields) q = q.select(query.fields.split(",").join(" "));
  q = q.skip(skip).limit(limit);
  const currentUserRoleConversation = await q.exec();

  const conversationList = await Promise.all(
    currentUserRoleConversation.map(async (conv) => {
      // find the other participant id
      const otherId = conv.participants.find((p) => p.toString() !== profileId);

      // Try to load as UserRole
      let otherDoc = null;
      if (otherId) {
        otherDoc = await UserRole.findById(otherId, "name ");
      }

      const unseenCount = await messages.countDocuments({
        conversationId: conv._id,
        msgByUserRoleId: { $ne: profileObjectId },
        seen: false,
      });

      return {
        _id: conv._id,
        userData: {
          _id: otherDoc?._id,
          name: otherDoc?.name,
          profileImage: otherDoc?.avatar,
        },
        unseenMsg: unseenCount,
        lastMsg: conv.lastMessage,
      };
    })
  );

  const meta = await conversations.countDocuments(filter);

  return {
    meta,
    result: conversationList,
  };
};

/**
 * Get all conversations for an event
 */
const allConversationIntoDb = async (eventId, query = {}) => {
  try {
    const page = parseInt(query?.page, 10) || 1;
    const limit = parseInt(query?.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let q = conversations
      .find({ eventId })
      .populate([
        { path: "participants", select: "name" },
        { path: "lastMessage", select: "text createdAt msgByUserRoleId seen" },
      ])
      .sort({ updatedAt: -1 });
    if (query?.fields) q = q.select(query.fields.split(",").join(" "));
    q = q.skip(skip).limit(limit);

    const allConversations = await q.exec();
    const meta = await conversations.countDocuments({ eventId });

    return { meta, allConversations };
  } catch (error) {
    throw new Error("Error getting all conversations");
  }
};

/**
 * Get single chat conversation list
 */
const getSingleConversationListIntoDb = async (currentUserRoleId, query) => {
  try {
    const page = parseInt(query?.page, 10) || 1;
    const limit = parseInt(query?.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let q = conversations
      .find({ participants: currentUserRoleId })
      .populate([
        { path: "participants", select: "name image" },
        { path: "lastMessage", select: "text createdAt msgByUserRoleId seen" },
      ])
      .sort({ updatedAt: -1 });
    if (query?.fields) q = q.select(query.fields.split(",").join(" "));
    q = q.skip(skip).limit(limit);

    const allConversations = await q.exec();
    const meta = await conversations.countDocuments({
      participants: currentUserRoleId,
    });

    const allConversationsResolved = await Promise.all(
      allConversations.map(async (conv) => {
        const participantsResolved = await Promise.all(
          (conv.participants || []).map(async (pid) => {
            try {
              const userDoc = await UserRole.findById(pid, "name image");
              if (userDoc) {
                return {
                  _id: userDoc._id,
                  name: userDoc.name,
                  image: userDoc.image,
                };
              }
            } catch (err) {
              // ignore and fall through to return raw id
            }
            return { _id: pid };
          })
        );

        return {
          ...conv.toObject(),
          participants: participantsResolved,
        };
      })
    );

    return { meta, allConversations: allConversationsResolved };
  } catch (error) {
    throw new Error("Error getting single conversation list");
  }
};

/**
 * Group conversation list (if you ever re-enable groups)
 */
const getGroupConversationListIntoDb = async (
  eventId,
  currentUserRoleId,
  query
) => {
  try {
    const page = parseInt(query?.page, 10) || 1;
    const limit = parseInt(query?.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let q = conversations
      .find({ _id: eventId })
      .populate([
        { path: "participants", select: "name image email" },
        { path: "lastMessage", select: "text createdAt" },
      ])
      .sort({ updatedAt: -1 });
    if (query?.fields) q = q.select(query.fields.split(",").join(" "));
    q = q.skip(skip).limit(limit);

    const allConversations = await q.exec();
    const meta = await conversations.countDocuments({ _id: eventId });

    return { meta, allConversations };
  } catch (error) {
    throw new Error("Error getting group conversation list");
  }
};

const ConversationService = {
  getConversation,
  allConversationIntoDb,
  getSingleConversationListIntoDb,
  getGroupConversationListIntoDb,
};

export default ConversationService;

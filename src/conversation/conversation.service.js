/* eslint-disable no-unused-vars */
import mongoose from "mongoose";
import messages from "../messages/schema/message.model.js";
import { Provider } from "../users/schema/provider.model.js";
import { User } from "../users/schema/user.model.js";
import apiError from "../utility/api-error.js";
import conversations from "./schema/conversation.model.js";

/**
 * Get all conversations of a user (with optional search)
 */
const getConversation = async (profileId, query) => {
  const profileObjectId = new mongoose.Types.ObjectId(profileId);
  const searchTerm = query?.searchTerm;

  // Build filter: conversations including the current profile
  const filter = { participants: profileObjectId };

  // If searchTerm is provided, restrict to conversations where the other
  // participant's id matches users/providers whose fullname matches the term.
  if (searchTerm) {
    const matchingUsers = await User.find(
      { fullname: { $regex: searchTerm, $options: "i" } },
      "_id"
    );
    const matchingUserIds = matchingUsers.map((u) => u._id);
    if (matchingUserIds.length > 0) {
      // require that participants include at least one of the matching ids
      filter.$and = [
        { participants: profileObjectId },
        { participants: { $in: matchingUserIds } },
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
  const currentUserConversation = await q.exec();

  const conversationList = await Promise.all(
    currentUserConversation.map(async (conv) => {
      // find the other participant id
      const otherId = conv.participants.find((p) => p.toString() !== profileId);

      // Try to load as User first, then Provider
      let otherDoc = null;
      if (otherId) {
        otherDoc = await User.findById(otherId, "fullname avatar ");
        if (!otherDoc) {
          otherDoc = await Provider.findById(otherId, "fullname avatar ");
        }
      }

      const unseenCount = await messages.countDocuments({
        conversationId: conv._id,
        msgByUserId: { $ne: profileObjectId },
        seen: false,
      });

      return {
        _id: conv._id,
        userData: {
          _id: otherDoc?._id,
          name: otherDoc?.fullname,
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
 * Placeholder for event-based conversation (can expand later)
 */
const allConversationIntoDb = async (eventId) => {
  try {
    return eventId;
  } catch (error) {
    throw new apiError(500, "server error all conversation", "");
  }
};

/**
 * Get single chat conversation list
 */
const getSingleConversationListIntoDb = async (currentUserId, query) => {
  try {
    const page = parseInt(query?.page, 10) || 1;
    const limit = parseInt(query?.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let q = conversations
      .find({ participants: currentUserId })
      .populate([
        { path: "participants", select: "fullname avatar " },
        { path: "lastMessage", select: "text createdAt msgByUserId seen" },
      ])
      .sort({ updatedAt: -1 });
    if (query?.fields) q = q.select(query.fields.split(",").join(" "));
    q = q.skip(skip).limit(limit);

    const allConversations = await q.exec();
    const meta = await conversations.countDocuments({
      participants: currentUserId,
    });

    const allConversationsResolved = await Promise.all(
      allConversations.map(async (conv) => {
        const participantsResolved = await Promise.all(
          (conv.participants || []).map(async (pid) => {
            try {
              const userDoc = await User.findById(pid, "fullname avatar ");
              if (userDoc) {
                return {
                  _id: userDoc._id,
                  fullname: userDoc.fullname,
                  avatar: userDoc.avatar,
                };
              }
              const providerDoc = await Provider.findById(
                pid,
                "fullname avatar "
              );
              if (providerDoc) {
                return {
                  _id: providerDoc._id,
                  fullname: providerDoc.fullname,
                  avatar: providerDoc.avatar,
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
    throw new apiError(
      503,
      error.message ||
        "Issue while fetching conversation list — server unavailable"
    );
  }
};

/**
 * Group conversation list (if you ever re-enable groups)
 */
const getGroupConversationListIntoDb = async (
  eventId,
  currentUserId,
  query
) => {
  try {
    const page = parseInt(query?.page, 10) || 1;
    const limit = parseInt(query?.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let q = conversations
      .find({ eventId })
      .populate([
        { path: "participants", select: "name photo email" },
        { path: "lastMessage", select: "text createdAt" },
      ])
      .sort({ updatedAt: -1 });
    if (query?.fields) q = q.select(query.fields.split(",").join(" "));
    q = q.skip(skip).limit(limit);

    const allConversations = await q.exec();
    const meta = await conversations.countDocuments({ eventId });

    return { meta, allConversations };
  } catch (error) {
    throw new apiError(
      503,
      error.message ||
        "Issue while fetching conversation list — server unavailable"
    );
  }
};

const ConversationService = {
  getConversation,
  allConversationIntoDb,
  getSingleConversationListIntoDb,
  getGroupConversationListIntoDb,
};

export default ConversationService;

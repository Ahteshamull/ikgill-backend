import Notification from "../models/Notification.js";
import Outfit from "../models/Outfit.js";
import { sendNotificationToUser } from "../socket.js";
import User from "../models/User.js"


// Create a single notification
export const createNotification = async ({ userId, plannerId = null, postId = null, adminMessageId = null }) => {
  const notification = await Notification.create({
    user: userId,
    planner: plannerId,
    post: postId,
    adminMessage: adminMessageId,
  });

  sendNotificationToUser(userId, notification);

  return notification;
};

// Get all notifications for a user
export const getUserNotifications = async (userId) => {

    const user1 = await User.findById({ _id: userId });
  if (!user1) throw new Error("User not found");
  if (user1.disabled) throw new Error("Account has disabled");

  return Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("planner post adminMessage");
};

// Mark as read
export const markAsRead = async (notificationId) => {
  
  const notify=await  Notification.findByIdAndUpdate(notificationId, { read: true }, { 
    new: true, 
    select: "post planner read" // only post, planner and read fields
  }).populate({
  path: "post",
  select: "title image user",
  populate: {path:"user",select:"username profileImage"}
}).populate("planner");
  return notify
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  return Notification.findByIdAndDelete(notificationId);
};

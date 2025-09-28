import * as notificationService from "../services/Notification.service.js";

export const getNotifications = async (req, res) => {
  const notifications = await notificationService.getUserNotifications(req.headers.user_id);
  res.json(notifications);
};

export const markNotificationRead = async (req, res) => {
  const notif = await notificationService.markAsRead(req.params.id);
  res.json(notif);
};

export const deleteNotification = async (req, res) => {
  await notificationService.deleteNotification(req.params.id);
  res.json({ success: true });
};

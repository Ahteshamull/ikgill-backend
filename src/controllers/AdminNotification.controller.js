import { getAdminNotifications, markAsReadAdminNotifications } from "../services/AdminNotification.services.js";


export const getAdminNotificationscontroller = async (req, res) => {
  const notifications = await getAdminNotifications(req.headers.user_id);
  res.json(notifications);
};

export const markAdminNotificationReadController = async (req, res) => {
  const notif = await markAsReadAdminNotifications(req.params.id);
  res.json(notif);
};



import Notification from "../../models/notification/notification.js";

export const listNotifications = async (req, res) => {
  try {
    const {
      receiverRole = "admin",
      isRead,
      page = 1,
      limit = 50,
      createdBy,
    } = req.query;

    const filter = { receiverRole };
    if (typeof isRead !== "undefined") {
      filter.isRead = isRead === "true";
    }
    if (createdBy) {
      filter.createdBy = createdBy;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const items = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Notification.countDocuments(filter);

    return res.json({
      success: true,
      items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Mark a notification as read
export const  markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Notification.findByIdAndUpdate(
      id,
      { $set: { isRead: true } },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    return res.json({ success: true, item: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

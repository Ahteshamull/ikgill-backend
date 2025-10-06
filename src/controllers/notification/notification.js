import Case from "../../models/case/caseModal.js";
import Notification from "../../models/notification/notification.js";


// Admin accepts or rejects a case
export const respondToCase = async (req, res) => {
  try {
    const { caseId, action, price } = req.body; // action = 'accept' | 'reject'

    const caseDoc = await Case.findById(caseId);
    if (!caseDoc)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });

    if (action === "accept") {
      caseDoc.status = "Accepted";
      if (price) caseDoc.price = Number(price);
      await caseDoc.save();

      // notify the case owner (user_<userId>)
      const notif = await Notification.create({
        type: "case_accepted",
        title: "Case Accepted",
        message: `Your case ${caseId} was accepted. Price: ${caseDoc.price}`,
        caseId,
        receiverRole: "dentist",
      });

      // Emit socket event if io is available
      if (req.io) {
        req.io.to(`user_${caseDoc.createdBy}`).emit("case_response", {
          action: "accept",
          caseId,
          price: caseDoc.price,
          notification: notif,
        });
      }

      return res.json({
        success: true,
        message: "Case accepted",
        case: caseDoc,
      });
    }

    if (action === "reject") {
      await Case.findByIdAndDelete(caseId);

      const notif = await Notification.create({
        type: "case_rejected",
        title: "Case Rejected",
        message: `Your case ${caseId} was rejected by admin.`,
        caseId,
        receiverRole: "dentist",
      });

      // Emit socket event if io is available
      if (req.io) {
        req.io.to(`user_${caseDoc.createdBy}`).emit("case_response", {
          action: "reject",
          caseId,
          notification: notif,
        });
      }

      return res.json({ success: true, message: "Case rejected and deleted" });
    }

    return res.status(400).json({ success: false, message: "Invalid action" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const listNotifications = async (req, res) => {
  try {
    const role = req.query.role || "admin";
    const items = await Notification.find({ receiverRole: role })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json({ success: true, items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

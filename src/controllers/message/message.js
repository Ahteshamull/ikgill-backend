import Admin from "../../models/admin/adminModal.js";
import userRoleModel from "../../models/users/userRoleModal.js";
import Message from "../../models/message/message.js";
import { getReceiverSocketId, io } from "../../utils/socket.js";
import Case from "../../models/case/caseModal.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const userRole = req.user.role; // Assuming role is in req.user

    let filteredUsers = [];

    // If user is Admin, show only users created by this admin
    if (userRole === "admin") {
      filteredUsers = await userRoleModel
        .find({ createdBy: loggedInUserId })
        .select("-password");
    } 
    // If user is UserRole, show only the admin who created them
    else {
      const user = await userRoleModel.findById(loggedInUserId);
      if (user && user.createdBy) {
        const admin = await Admin.findById(user.createdBy).select("-password");
        if (admin) {
          filteredUsers = [admin];
        }
      }
    }

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    // Case-scoped messages if caseId provided
    const { caseId } = req.query;
    const myId = req.user._id?.toString();

    if (caseId) {
      const caseDoc = await Case.findById(caseId).select(
        "createdByUserRole assignedTechnician"
      );
      if (!caseDoc) {
        return res.status(404).json({ success: false, error: "Case not found" });
      }
      const dentistId = caseDoc.createdByUserRole?.toString();
      const techId = caseDoc.assignedTechnician?.toString();

      // requester must be either dentist or assigned technician
      if (myId !== dentistId && myId !== techId) {
        return res.status(403).json({ success: false, error: "Not allowed" });
      }

      const messages = await Message.find({ caseId }).sort({ createdAt: 1 });
      return res.status(200).json(messages);
    }

    // fallback: user-to-user thread with role/admin checks
    const { id: userToChatId } = req.params;

    // Determine target type (UserRole or Admin)
    const targetUser = await userRoleModel.findById(userToChatId).select("role createdBy");
    const targetAdmin = targetUser ? null : await Admin.findById(userToChatId).select("_id");

    // Load requester as UserRole if not admin
    const isRequesterAdmin = req.user.role === "admin";
    if (isRequesterAdmin) {
      // Admin can only chat with users they created
      if (!targetUser || targetUser.createdBy?.toString() !== myId) {
        return res.status(403).json({ success: false, error: "Not allowed" });
      }
    } else {
      // Requester is a UserRole
      const requester = await userRoleModel.findById(myId).select("role createdBy");
      if (!requester) {
        return res.status(403).json({ success: false, error: "Not allowed" });
      }
      if (targetUser) {
        // UserRole ↔ UserRole only if roles match
        if (requester.role !== targetUser.role) {
          return res.status(403).json({ success: false, error: "Role mismatch" });
        }
      } else if (targetAdmin) {
        // UserRole ↔ Admin only if this admin created the user
        if (!requester.createdBy || requester.createdBy.toString() !== targetAdmin._id.toString()) {
          return res.status(403).json({ success: false, error: "Not allowed" });
        }
      } else {
        return res.status(404).json({ success: false, error: "User not found" });
      }
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, receiverModel, caseId } = req.body;
    const { id: receiverIdParam } = req.params; // optional legacy param
    const senderId = req.user._id?.toString();

    // Collect media
    const images = [];
    const audios = [];
    const videos = [];
    if (req.files?.length) {
      for (const item of req.files) {
        const url = `${process.env.IMAGE_URL}${item.filename}`;
        const type = item.mimetype || "";
        if (type.startsWith("image/")) images.push(url);
        else if (type.startsWith("audio/")) audios.push(url);
        else if (type.startsWith("video/")) videos.push(url);
        else images.push(url); // fallback
      }
    }

    // If caseId provided, enforce dentist ↔ assigned technician messaging
    if (caseId) {
      const caseDoc = await Case.findById(caseId).select(
        "createdByUserRole assignedTechnician"
      );
      if (!caseDoc) {
        return res.status(404).json({ success: false, error: "Case not found" });
      }
      const dentistId = caseDoc.createdByUserRole?.toString();
      const techId = caseDoc.assignedTechnician?.toString();
      if (!dentistId || !techId) {
        return res.status(400).json({ success: false, error: "Case must have creator and assigned technician" });
      }

      let receiverId;
      if (senderId === dentistId) receiverId = techId;
      else if (senderId === techId) receiverId = dentistId;
      else return res.status(403).json({ success: false, error: "Not allowed for this case" });

      const newMessage = new Message({
        senderId,
        senderModel: "UserRole",
        receiverId,
        receiverModel: "UserRole",
        caseId,
        text,
        image: images,
        audio: audios,
        video: videos,
      });

      await newMessage.save();
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);
      return res.status(201).json(newMessage);
    }

    // Otherwise: role-based or admin-user messaging
    const isSenderAdmin = req.user.role === "admin";
    const receiverId = receiverIdParam;

    if (!receiverId) {
      return res.status(400).json({ success: false, error: "receiverId is required" });
    }

    const receiverUser = await userRoleModel.findById(receiverId).select("role createdBy");
    const receiverAdmin = receiverUser ? null : await Admin.findById(receiverId).select("_id");

    if (isSenderAdmin) {
      // Admin → User: only if admin created that user
      if (!receiverUser || receiverUser.createdBy?.toString() !== senderId) {
        return res.status(403).json({ success: false, error: "Not allowed" });
      }

      const newMessage = new Message({
        senderId,
        senderModel: "Admin",
        receiverId,
        receiverModel: "UserRole",
        text,
        image: images,
        audio: audios,
        video: videos,
      });
      await newMessage.save();
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);
      return res.status(201).json(newMessage);
    }

    // Sender is UserRole
    const senderUser = await userRoleModel.findById(senderId).select("role createdBy");
    if (!senderUser) return res.status(403).json({ success: false, error: "Not allowed" });

    if (receiverUser) {
      // UserRole ↔ UserRole allowed only if roles match
      if (senderUser.role !== receiverUser.role) {
        return res.status(403).json({ success: false, error: "Role mismatch" });
      }
      const newMessage = new Message({
        senderId,
        senderModel: "UserRole",
        receiverId,
        receiverModel: "UserRole",
        text,
        image: images,
        audio: audios,
        video: videos,
      });
      await newMessage.save();
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);
      return res.status(201).json(newMessage);
    }

    if (receiverAdmin) {
      // UserRole ↔ Admin allowed only if this admin created the user
      if (!senderUser.createdBy || senderUser.createdBy.toString() !== receiverAdmin._id.toString()) {
        return res.status(403).json({ success: false, error: "Not allowed" });
      }
      const newMessage = new Message({
        senderId,
        senderModel: "UserRole",
        receiverId,
        receiverModel: "Admin",
        text,
        image: images,
        audio: audios,
        video: videos,
      });
      await newMessage.save();
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);
      return res.status(201).json(newMessage);
    }

    return res.status(404).json({ success: false, error: "Receiver not found" });

  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // e.g. 'case_created'
    title: String,
    message: String,
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiverRole: { type: String, default: "admin" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);

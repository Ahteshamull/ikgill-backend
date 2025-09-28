import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  Registration:{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
  Report:{ type: mongoose.Schema.Types.ObjectId, ref: "Report" },
  Feedback:{ type: mongoose.Schema.Types.ObjectId, ref: "Feedback" },
  delete:{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message:{ type: String },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("AdminNotification", notificationSchema);

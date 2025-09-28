import mongoose from "mongoose";

const affiliateDataSchema = new mongoose.Schema({
  type: { type: String },
  title: { type: String },
  description: { type: String },
  image: { type: String },
  link: { type: String },
  
}, { _id: false }); // prevents extra _id inside affilateData

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planner: { type: mongoose.Schema.Types.ObjectId, ref: "Planner", default: null },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Outfit", default: null },
  adminMessage: { type: String },
  affilateData: affiliateDataSchema, // 👈 embedded object
  read: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);

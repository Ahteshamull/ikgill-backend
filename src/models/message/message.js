import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderModel",
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["Admin", "UserRole"],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "receiverModel",
    },
    receiverModel: {
      type: String,
      required: true,
      enum: ["Admin", "UserRole"],
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: false,
    },
    text: {
      type: String,
    },
    image: {
      type: [String],
    },
    audio: {
      type: [String],
    },
    video: {
      type: [String],
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;

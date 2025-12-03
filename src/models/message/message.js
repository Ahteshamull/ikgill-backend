import { Schema, model } from "mongoose";

const conversationSchema = new Schema(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: "UserRole",
      // participants can be either a User or a Provider. We store ObjectIds
      // and resolve the concrete model at service/controller level.
      required: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "messages",
      default: null,
    },

    isDelete: {
      type: Boolean,
      required: [false, "isDelete is not required"],
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const conversations = model("conversations", conversationSchema);

export default conversations;

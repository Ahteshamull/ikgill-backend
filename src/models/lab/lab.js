import mongoose from "mongoose";
const { Schema } = mongoose;

const labSchema = new Schema(
  {
    name: {
      type: String,
      required: [true],
      trim: true,
    },
    email: {
      type: String,
      required: [true],
      unique: [true],
      trim: true,
    },
    details: {
      type: String,
      required: [true],
      trim: true,
    },
    labStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserRole",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Lab", labSchema);

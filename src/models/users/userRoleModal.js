import mongoose from "mongoose";
const { Schema } = mongoose;

const userRoleSchema = new Schema(
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
    phone: {
      type: String,
      required: [true],
      trim: true,
    },
    image: {
      type: [String],
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    clinic: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    lab: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("UserRole", userRoleSchema);

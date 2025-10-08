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
    userStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    role: {
      type: String,
      enum: [
        "dentist",
        "labmanager",
        "practicemanager",
        "practicenurse",
        "labtechnician",
      ],
      default: "dentist",
    },
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
    },
    lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
    },
    caseListAccess: {
      type:Boolean,
     default:false,
    },
    archivesAccess: {
      type:Boolean,
     default:false,
    },
    sendMessagesToDoctors: {
      type:Boolean,
     default:false,
    },
    qualityCheckPermission: {
      type:Boolean,
     default:false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("UserRole", userRoleSchema);

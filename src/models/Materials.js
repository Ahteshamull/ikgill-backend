import mongoose from "mongoose";

const MaterialsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin who created it
      
    },
  },
  { timestamps: true }
);

export default mongoose.model("material", MaterialsSchema);

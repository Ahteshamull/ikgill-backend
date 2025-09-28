import mongoose from "mongoose";

const plannerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    outfit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outfit", 
      required: true,
    },
    date: { type: Date, required: true },      // Stores the day
  time: { type: String, required: true }, 
  },
  { timestamps: true }
);

export default mongoose.model("Planner", plannerSchema);

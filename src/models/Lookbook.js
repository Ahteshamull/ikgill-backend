import mongoose from "mongoose";

const lookbookSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    outfits: [{ type: mongoose.Schema.Types.ObjectId, ref: "Outfit" }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const Lookbook = mongoose.model("Lookbook", lookbookSchema);

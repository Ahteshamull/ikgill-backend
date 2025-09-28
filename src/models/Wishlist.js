import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    images: [{ type: String }], 
  },
  { timestamps: true }
);

export default mongoose.model("Wishlist", wishlistSchema);

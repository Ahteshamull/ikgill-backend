import { Schema, model } from "mongoose";
const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  image: { type: String, required: true },
  type: { type: String, enum: ["item", "outfit"], required: true },
  reactors: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, reaction: String }],
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
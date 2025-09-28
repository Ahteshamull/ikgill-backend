import { Schema, model } from "mongoose";
const groupSchema = new Schema({
  title: { type: String, required: true },
  items: [{ type: Schema.Types.ObjectId, ref: "Item" }],
});

export default model("Group", groupSchema);
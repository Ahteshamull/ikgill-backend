import { Schema, model } from "mongoose";
const DressMeSchema = new Schema({
  user:[{ type: Schema.Types.ObjectId, ref: "User" }],
  title: { type: String, required: true },
  groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  style: [String],
  season: [String],
});

export default model("DressMe", DressMeSchema);
import { Schema, model } from "mongoose";
const CategorySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User"},
  name: { type: String, required: true,unique: true },
  
  items: { type: Schema.Types.ObjectId, ref: "Item" }
}, { timestamps: true });

export default model("category", CategorySchema);

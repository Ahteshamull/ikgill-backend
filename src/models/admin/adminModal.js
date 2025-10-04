import mongoose from "mongoose";
const { Schema } = mongoose;

const adminSchema = new Schema({
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
  image: {
    type:[String],
    },
  password: {
    type: String,
    required: [true],
    trim: true,
    },
  role: {
    type: String,
    enum: ["admin", "superadmin"],
    default: "admin",
    }
 

});

export default mongoose.model("Admin", adminSchema);

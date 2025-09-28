import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String,default:"" },
  profile:{type:String,default:"" },
  dob:{type:Date,default:""},
  gender: { type: String, enum: ["male", "female", "other"] },
  otp: { type: String },
  otpExpires: { type: Date },
}, { timestamps: true });



export default model("Admin", userSchema);
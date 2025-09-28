import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },

  name: { type: String },
  username:{type:String},
  phone:{type:String, unique:true, sparse:true},
  otp: { type: String },
  otpExpires: { type: Date },
  gender: { type: String},
  language: { 
  type: String, 
  enum: ["English", "Russian"], 
  default: "English" 
},
  profileImage:   { type: String,default: "" },
  dob: { type: String,default: "" },
  bio: { type: String ,default: ""},
  location: { type: String,default: "" },
  followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: Schema.Types.ObjectId, ref: "User" }],
  blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  privacy: {
    profile: { type: String, enum: ["everyone", "only_me", "followers"], default: "everyone" },
    items: { type: String, enum: ["everyone", "only_me", "followers"], default: "everyone" },
    outfits: { type: String, enum: ["everyone", "only_me", "followers"], default: "everyone" },
    lookbooks: { type: String, enum: ["everyone", "only_me", "followers"], default: "everyone" }
  },
  // language: { type: String, default: "en" },
  
  notificationsEnabled: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  active:{type:Boolean,default: false},
  reports: [
    {
      reporter: { type: Schema.Types.ObjectId, ref: "User", required: true }, 
      message: { type: String, required: true },
      reportedAt: { type: Date, default: Date.now }
    }
  ],
  loginHistory: [
  {
    loginAt: { type: Date, required: true },
    logoutAt: { type: Date } 
  }
],
firstLogin: { type: Date } 
}, { timestamps: true });



export default model("User", userSchema);

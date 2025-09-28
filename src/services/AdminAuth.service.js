import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import  SendEmail  from "./email.service.js"; // implement email sending
import { OAuth2Client } from "google-auth-library";
import appleSigninAuth from "apple-signin-auth";
import { JWT_EXPIRE_TIME, JWT_KEY, JWT_KEY_ADMIN } from "../config/token.config.js";
import Admin from "../models/Admin.js";
import { createAdminNotification } from "./AdminNotification.services.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Signup
export const signup = async (data) => {
  const {  email, password,confirmPassword } = data;
  
  // Check for existing user first
  const existingUser = await Admin.findOne({email});

  if (existingUser) {
    throw new Error('User already exists with this email');
  }
  if(password !==confirmPassword){
    throw new Error("Password and confirmPassword isn't same");
  }
  
  if(password.length<6){
     throw new Error('password must be alteast 6 characters');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const admin = new Admin({ 
      email, 
      password: hashedPassword 
    });
    
      const token = jwt.sign({ id: admin._id }, JWT_KEY_ADMIN, {
    expiresIn: JWT_EXPIRE_TIME || "7d",
  });

  await admin.save();

    return {admin,token};
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error
      console.log(error)
      throw new Error('User already exists');
    }
    throw error;
  }
};

// Signin
export const signin = async (email, password) => {
  const user = await Admin.findOne({ email });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid password");

  const token = jwt.sign({ id: user._id }, JWT_KEY_ADMIN, {
    expiresIn: JWT_EXPIRE_TIME || "7d",
  });
await Admin.findOneAndUpdate(
  { email:email },   // filter
  { $set: { active: true } },  // update
  { new: true }                // return updated doc
);
  return { gmail:user.email, token };
};

// Signout
export const signout = async (req,res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "Strict" });
  await Admin.findOneAndUpdate({_id:req.headers.user_id},{active:false},{new:true})

  return { message: "Signed out successfully" };
};

// Forgot Password → Send OTP
export const forgotPassword = async (email) => {
  const user = await Admin.findOne({ email });
  console.log(user)
  if (!user) throw new Error("User not found");

  const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
  await user.save();

  // Send OTP to email
  await SendEmail(email, `Password Reset OTP ${otp}`, `Your OTP is ${otp}`);
  
  return { message: "OTP sent to email" };
};

// Reset Password → Verify OTP & Update
export const AdminOtpVerify = async (email, otp) => {
  const user = await Admin.findOne({ email });
  if (!user) throw new Error("User not found");
  if (user.otp !== otp || Date.now() > user.otpExpires) throw new Error("Invalid or expired OTP");


  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  return { message: "Otp has successfully Verified" };
};

// Google Login
export const googleLogin = async (idToken) => {
    const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name } = payload;

  if (!email) throw new Error("Google account must have an email");

  let user = await Admin.findOne({ email });
  if (!user) {
    const user = new Admin({
      name,
      email,
      username:email.split("@")[0],
      password: crypto.randomBytes(16).toString("hex")
    });
    await user.save();
}

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  return { user, token };
};


export const updateAdminProfile = async (userId, jsonData,file) => {
  try {
 
  //  const  updateData= JSON.parse(jsonData);
   const  updateData= jsonData
   
  const user = await Admin.findById(userId)




  if (!user) {
    throw new Error("User not found");
  }

  // If image is provided

  if (file) {
    user.profile = file;
  }

  // Update only provided fields (PATCH behavior)
  if (updateData.name) user.name = updateData.name;
  if(updateData.gender)user.gender=updateData.gender;
  if(updateData.dob)user.dob=updateData.dob;
  await user.save();
  return user;
  } catch (error) {
    return error
  }
};

export const getAdminProfile = async (userId) => {
    
  const user = await Admin.findById(userId).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};


export const resetAdminPassword = async (email, password, confirmPassword ) => {
  console.log(password)
   if(password !==confirmPassword){
    throw new Error("Password and confirmPassword isn't same");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const user =await Admin.findOneAndUpdate(
    { email },
    { $set: { password: hashedPassword } },
    { new: true }
  );
    
      
  

console.log(user)
    return {user};
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error
      console.log("fslkldk")
      console.log(error)
      throw new Error('Error');
    }
    throw error;
  }
};





export const AdmingoogleSignInService = async (email, profileImage) => {
  try {
    // check if user exists
    let Admins = await Admin.findOne({ email });

    if (!Admins) {
      // create new user if not exists
      Admins = new Admin({
        email,
        profile: profileImage,
        password: crypto.randomBytes(16).toString("hex"), // random password
        
      });
      await Admins.save();
    }

    // create token
   const token = jwt.sign({ id: Admins._id }, JWT_KEY_ADMIN, {
    expiresIn: JWT_EXPIRE_TIME || "7d",
  });

    return { Admins, token };
  } catch (error) {
    throw new Error("Google SignIn failed: " + error.message);
  }
};

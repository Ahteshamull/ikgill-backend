import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import  SendEmail  from "./email.service.js"; // implement email sending
import { OAuth2Client } from "google-auth-library";
import appleSigninAuth from "apple-signin-auth";
import { JWT_EXPIRE_TIME, JWT_KEY } from "../config/token.config.js";
import { createAdminNotification } from "./AdminNotification.services.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Signup
export const signup = async (data) => {
  const {  email, password,confirmPassword } = data;
  
  // Check for existing user first
  const existingUser = await User.findOne({email});

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
    const user = new User({ 
      email, 
      password: hashedPassword 
    });
    
      const token = jwt.sign({ id: user._id }, JWT_KEY, {
    expiresIn: JWT_EXPIRE_TIME || "7d",
  });
  console.log(token)
await User.findOneAndUpdate(
  { email:email },   // filter
  { $set: { active: true } },  
  { new: true }                
);
const now = new Date();

  // Set firstLogin if not set
  if (!user.firstLogin) {
    user.firstLogin = now;
  }

  // Add new login entry to loginHistory

  // user.loginHistory.push({ loginAt: now });

  await user.save();
  await createAdminNotification({
      userId: user._id,
      RegistratedId: user._id
    });
    return {user,token};
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
  const user = await User.findOne({ email });

  
  if (!user) throw new Error("User not found");
  if (user.disabled) throw new Error("Account has banned!");
  // if(user.active) throw new Error("Already LogedIn");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid password");
  
  const token = jwt.sign({ id: user._id }, JWT_KEY, {
    expiresIn: JWT_EXPIRE_TIME || "7d",
  });
await User.findOneAndUpdate(
  { email:email },   // filter
  { $set: { active: true } },  
  { new: true }                
);

const now = new Date();

  // Set firstLogin if not set
  if (!user.firstLogin) {
    user.firstLogin = now;
  }

  // Add new login entry to loginHistory
  // user.loginHistory.push({ loginAt: now });
  await user.save();


  return { user, token };
};

// Signout
export const signout = async (req,res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "Strict" });
const user=  await User.findOneAndUpdate({_id:req.headers.user_id},{active:false},{new:true})

  const now = new Date();

  // Find the last login entry without logoutAt
  const lastLogin = user.loginHistory[user.loginHistory.length - 1];
  if (lastLogin && !lastLogin.logoutAt) {
    lastLogin.logoutAt = now;
    await user.save();
  }

  return { message: "Signed out successfully" };
};

// Forgot Password → Send OTP
export const forgotPassword = async (email) => {
  console.log("lksdlksd")
  const user = await User.findOne({ email });
  
  if (!user) throw new Error("User not found");
    if (user.disabled) throw new Error("Account has banned!");


  const otp = crypto.randomInt(1000, 9999).toString(); // 4-digit OTP
  user.otp = otp;
  console.log(otp,"jflskd")
  user.otpExpires = Date.now() + 5 * 60 * 1000; // 10 mins
  await user.save();

  // Send OTP to email
  console.log(email)
  await SendEmail(email, `The Otp is ${otp}. And it valid for 5 mins `, `Your OTP is ${otp}`);
  
  
  return { message: "OTP sent to email" };
};


export const verifyOtpService = async (email, otp) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("User not found");
    if (user.disabled) throw new Error("Account has banned!");

  if (!user.otp || !user.otpExpires) throw new Error("OTP not requested");

  if (user.otp !== otp) throw new Error("Invalid OTP");
  if (user.otpExpires < Date.now()) throw new Error("OTP expired");

  // ✅ OTP valid → clear OTP
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  return { message: "OTP verified successfully", email };
};

// Reset Password → Verify OTP & Update
export const resetPassword = async (email, password, confirmPassword ) => {
  console.log(password)
   if(password !==confirmPassword){
    throw new Error("Password and confirmPassword isn't same");
  }
  console.log(password.length)
  if(password.length<6){
     throw new Error('password must be alteast 6 characters');
  }
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
    if (user.disabled) throw new Error("Account has banned!");
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const user = new User({ 
      email, 
      password: hashedPassword 
    });
    
      
  
  await user.save();

    return {user};
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error
      console.log(error)
      throw new Error('Error');
    }
    throw error;
  }
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

  let user = await User.findOne({ email });
  if (!user) {
    const user = new User({
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

// Apple Login (similar to Google)
export const appleLogin = async (idToken) => {

const appleData = await appleSigninAuth.verifyIdToken(idToken, {
    audience: process.env.APPLE_CLIENT_ID,
    ignoreExpiration: false,
  });

  const email = appleData.email;
  const name = appleData.name || "Apple User";

  if (!email) throw new Error("Apple account must have an email");


    let user = await User.findOne({ email });
  if (!user) {
    const user = new User({
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







export const changePasswordService = async (userId, currentPassword, newPassword, confirmPassword) => {
  // 1. Find user by ID
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // 2. Check current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Current password is incorrect");

  if(newPassword.length<6){
    throw new Error("Password is less than 6 characters");

  }
  // 3. Confirm new password
  if (newPassword !== confirmPassword) {
    throw new Error("New password and confirm password do not match");
  }

  // 4. Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // 5. Update user password
  user.password = hashedPassword;
  await user.save();

  return { message: "Password updated successfully" };
};








export const googleSignInService = async (email, profileImage) => {
  try {
    // check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // create new user if not exists
      user = new User({
        email,
        profileImage,
        password: crypto.randomBytes(16).toString("hex"), // random password
        active: true,
      });
      await user.save();
    }

    // create token
   const token = jwt.sign({ id: user._id }, JWT_KEY, {
    expiresIn: JWT_EXPIRE_TIME || "7d",
  });

    return { user, token };
  } catch (error) {
    throw new Error("Google SignIn failed: " + error.message);
  }
};

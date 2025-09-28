import * as authService from "../services/auth.service.js";
import {  Emailschema, userschema } from "../utils/Validation.js";


// Signup
export const signup = async (req, res) => {
  try {
   const result = userschema.safeParse({email:req.body.email , password: req.body.password});
  if (!result.success) {
    // Extract only messages you defined in the schema
    const messages = result.error.issues.map(err => err.message);

    return res.status(400).json({
      success: false,
      message: messages,   // 👈 only your custom messages
    });
  }
    const { user, token } = await authService.signup(req.body);
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict" });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Signin
export const signin = async (req, res) => {
  try {
  const result = userschema.safeParse(req.body);
  if (!result.success) {
    // Extract only messages you defined in the schema
    const messages = result.error.issues.map(err => err.message);

    return res.status(400).json({
      success: false,
      message: messages,   // 👈 only your custom messages
    });
  }


    const { email, password } = req.body;
    const { user, token } = await authService.signin(email, password);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    res.status(200).json({ success: true, data: user , token});
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Signout
export const signout = async (req, res) => {
  try {
    const data = await authService.signout(req,res);
    res.status(200).json({ success: true, message: data.message });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const data = await authService.forgotPassword(email);
    res.status(200).json({ success: true, message: data.message });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const verifyOtpController = async (req, res) => {
  try {
    const results = Emailschema.safeParse({email:req.body.email });
  if (!results.success) {
    // Extract only messages you defined in the schema
    const messages = results.error.issues.map(err => err.message);

    return res.status(400).json({
      success: false,
      message: messages,   // 👈 only your custom messages
    });
  }
    
    const { email, otp } = req.body;
    const result = await authService.verifyOtpService(email, otp);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const result = userschema.safeParse({email:req.body.email, password:req.body.password});
  if (!result.success) {
    // Extract only messages you defined in the schema
    const messages = result.error.issues.map(err => err.message);

    return res.status(400).json({
      success: false,
      message: messages,   // 👈 only your custom messages
    });
  }

    const { email, password, confirmPassword } = req.body;
    const data = await authService.resetPassword(email,  password,confirmPassword,);
    res.status(200).json({ success: true, message: data.message });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Google Login
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body; // from passport/google strategy
    const { user, token } = await authService.googleLogin(idToken);
    res.cookie("token", token, { 8: true });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Apple Login
export const appleLogin = async (req, res) => {
  try {
    const { profile } = req.body;
    const { user, token } = await authService.appleLogin(profile);
    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};






export const changePasswordController = async (req, res) => {
  try {
    const userId= req.headers.user_id 
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const result = await authService.changePasswordService(userId, currentPassword, newPassword, confirmPassword);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};





export const googleSignInController = async (req, res) => {
  try {
    const { email, profileImage } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const { user, token } = await authService.googleSignInService(email, profileImage);

    // set token in cookies
   res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({
      message: "Google Sign-In successful",
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


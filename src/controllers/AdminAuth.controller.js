import * as authService from "../services/AdminAuth.service.js";
import { userschema } from "../utils/Validation.js";

// Signup
export const signup = async (req, res) => {
  try {
    const result = userschema.safeParse({
      email: req.body.email,
      password: req.body.password,
    });
    if (!result.success) {
      // Extract only messages you defined in the schema
      const messages = result.error.issues.map((err) => err.message);

      return res.status(400).json({
        success: false,
        message: messages, // 👈 only your custom messages
      });
    }

    const user = await authService.signup(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Signin
// Signin
export const signin = async (req, res) => {
  console.log(`req.body`, req.body);
  try {
    const result = userschema.safeParse({
      email: req.body.email,
      password: req.body.password,
    });
    console.log(`result `, result);

    if (!result.success) {
      // Extract only messages you defined in the schema
      const messages = result.error.issues.map((err) => err.message);

      return res.status(400).json({
        success: false,
        message: messages, // 👈 only your custom messages
      });
    }
    // let token="dummytoken";
    const { email, password } = req.body;
    console.log(`email`, email, "password", password);
    const { gmail, token } = await authService.signin(email, password);
    // console.log(`gmail`, gmail,  "token", token);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.status(200).json({ success: true, email: gmail, token });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// Signout
export const signout = async (req, res) => {
  try {
    const data = await authService.signout(req, res);
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

// Reset Password
export const VerifyAdminEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const data = await authService.AdminOtpVerify(email, otp);
    res.status(200).json({ success: true, message: data.message });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const resetAdminPasswordController = async (req, res) => {
  try {
    const result = userschema.safeParse({
      email: req.body.email,
      password: req.body.password,
    });
    if (!result.success) {
      // Extract only messages you defined in the schema
      const messages = result.error.issues.map((err) => err.message);

      return res.status(400).json({
        success: false,
        message: messages, // 👈 only your custom messages
      });
    }

    const { email, password, confirmPassword } = req.body;
    const data = await authService.resetAdminPassword(
      email,
      password,
      confirmPassword
    );
    res.status(200).json({ success: true, message: "password has successfully Reseted",email:data.user.email,id:data.user._id});
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

export const updateAdminProfileController = async (req, res, next) => {
  try {
    const userId = req.headers.user_id;
    console.log(userId);
    const updateData = req.body; // Assuming the update data is in the request body
    let imageUrl = null;
if (req.file) {
  imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
}

    console.log(updateData);
    const updatedProfile = await authService.updateAdminProfile(
      userId,
      updateData,
      imageUrl
    );
    res.json(updatedProfile);
  } catch (error) {
    next(error);
  }
};

export const getAdminProfileController = async (req, res, next) => {
  try {
    const profile = await authService.getAdminProfile(req.headers.user_id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};





export const AdmingoogleSignInController = async (req, res) => {
  try {
    const { email, profileImage } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const { Admin, token } = await authService.AdmingoogleSignInService(email, profileImage);

    // set token in cookies
   res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({
      message: "Google Sign-In successful",
      Admin,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
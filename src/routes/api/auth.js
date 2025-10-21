import express from "express";
import {
  forgotPassword,
  login,
  logout,
  OtpVerify,
  refreshAccessToken,
  ResendOtp,
  resetPassword,
  signup,
  testEmailConfig,
  verifyResetOTP,
  changePassword,
} from "../../controllers/auth/auth.js";
import userAuthMiddleware from "../../middlewares/userAuthMiddleware.js";
const router = express.Router();
//localhost:3000/api/v1/auth/registration
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.patch("/reset-password", resetPassword);
router.post("/refresh-token", refreshAccessToken);
router.post("/otp-verify", OtpVerify);
router.post("/resend-otp", ResendOtp);
router.get("/test-email", testEmailConfig);
router.patch("/change-password", userAuthMiddleware, changePassword);

export default router;

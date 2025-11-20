import express from "express";
import {
  forgotPassword,
  adminLogin,
  adminLogout,
  OtpVerify,
  refreshAccessToken,
  ResendOtp,
  resetPassword,
  adminSignup,
  testEmailConfig,
  verifyResetOTP,
  changePassword,
} from "../../controllers/auth/auth.js";
import userAuthMiddleware from "../../middlewares/userAuthMiddleware.js";
import superAdminMiddleware from "../../middlewares/superAdminMiddleware.js";
const router = express.Router();
//localhost:3000/api/v1/auth/registration
router.post("/signup", superAdminMiddleware, adminSignup);
router.post("/login", adminLogin);
router.post("/logout", adminLogout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.patch("/reset-password", resetPassword);
router.post("/refresh-token", refreshAccessToken);
router.post("/otp-verify", OtpVerify);
router.post("/resend-otp", ResendOtp);
router.get("/test-email", testEmailConfig);
router.patch("/change-password", changePassword);

export default router;

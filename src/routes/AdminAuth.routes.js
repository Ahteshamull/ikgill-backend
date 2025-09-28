import express from "express";
import { signup, signin, forgotPassword, googleLogin,  signout, updateAdminProfileController, VerifyAdminEmail, resetAdminPasswordController, getAdminProfileController, AdmingoogleSignInController } from "../controllers/AdminAuth.controller.js";
import {authChecks}from"../middlewares/authForAdmin.middleware.js"
import { SingleuploadMiddleware } from "../middlewares/awsUpload.middleware.js";

const AdminAuthRoutes = express.Router();


AdminAuthRoutes.post("/signin", signin)
AdminAuthRoutes.post("/signup",signup )
AdminAuthRoutes.post("/ProfileUpdate",authChecks,SingleuploadMiddleware,updateAdminProfileController )
AdminAuthRoutes.post("/forgot-password",forgotPassword )
AdminAuthRoutes.post("/reset-password", resetAdminPasswordController)
AdminAuthRoutes.post("/verifyAdminEmail", VerifyAdminEmail)
AdminAuthRoutes.post("/google",googleLogin )
AdminAuthRoutes.get("/signout",authChecks, signout)
AdminAuthRoutes.get("/GetAdminProfile",authChecks,getAdminProfileController )

AdminAuthRoutes.post("/googleApple",AdmingoogleSignInController  )





export default AdminAuthRoutes;



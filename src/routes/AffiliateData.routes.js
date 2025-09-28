import express from "express";
import {
  createAffiliateData,
  getAllAffiliateData,
  editAffiliateData,
  deleteAffiliateData,
  getAffiliatedDataById
} from "../controllers/AffiliateData.controller.js";
import { SingleuploadMiddleware, uploadMiddleware } from "../middlewares/awsUpload.middleware.js";
import {authChecks}from"../middlewares/authForAdmin.middleware.js"

const AffiliateDataRoute = express.Router();

// Admin notification management
AffiliateDataRoute.post("/notifications", authChecks,SingleuploadMiddleware, createAffiliateData);     // Create
AffiliateDataRoute.get("/getnotifications", getAllAffiliateData);     // View all
AffiliateDataRoute.get("/notificationsById/:id", getAffiliatedDataById);     // View all
AffiliateDataRoute.put("/notifications/:id",SingleuploadMiddleware, editAffiliateData);    // Edit
AffiliateDataRoute.delete("/notifications/:id", deleteAffiliateData); // Delete

export default AffiliateDataRoute;

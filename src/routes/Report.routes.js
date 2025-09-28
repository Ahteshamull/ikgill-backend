import express from "express";
import { BannedStatusController, createReportController,deleteReportByIdController,deleteReportwithCommunityByIdController,getAllReportsController, getReportDetailsByIdController, searchReportsController, toggleReportStatusController } from "../controllers/Report.controller.js";
import { authCheck } from "../middlewares/auth.middleware.js"; // your JWT auth middleware
import { authChecks } from "../middlewares/authForAdmin.middleware.js";

const  ReportRoute= express.Router();

// Create a new report (user or community post)
ReportRoute.post("/ReportCreate", authCheck, createReportController);
ReportRoute.get("/ReportRead", authChecks, getAllReportsController);
ReportRoute.post("/Reportdelete", authChecks, deleteReportByIdController);
ReportRoute.post("/ReportWithPostdelete", authChecks, deleteReportwithCommunityByIdController);
ReportRoute.post("/ReportStatusToggle", authChecks, toggleReportStatusController);
ReportRoute.post("/BannedPost", authChecks, BannedStatusController);




ReportRoute.post("/ReportFilter", authChecks,searchReportsController);
ReportRoute.get("/reports/:id", authChecks, getReportDetailsByIdController);







export default ReportRoute;

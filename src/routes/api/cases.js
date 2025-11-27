import express from "express";
import {
  createCase,
  getAllCases,
  getCaseById,
  updateCase,
  deleteCase,
  updateCaseStatus,
  getCasesByPatient,
  getCasesByClinic,
  remakeCase,
  adminApproveCase,
  assignToTechnician,
  getPendingCasesForAdmin,
  getAcceptedCasesForLabManager,
  getCasesForTechnician,
  getArchivedCases,
  caseDownload,
  getInProgressCases,
  getCompletedCases,
} from "../../controllers/case/case.js";
import { upload } from "../../middlewares/imageControlMiddleware.js";
import userAuthMiddleware from "../../middlewares/userAuthMiddleware.js";
import { USER_ROLES, roleBasedAuth } from "../../middlewares/roleBasedAuth.js";

const router = express.Router();
// localhost:3000/api/v1/case/create-case
// Case CRUD operations
router.post(
  "/create-case",
  roleBasedAuth([USER_ROLES.DENTIST]),
  upload.any(),
  createCase
); // Only dentists can create cases

// localhost:3000/api/v1/case/all-case
router.get("/all-case", getAllCases); // Get all cases with filters

// localhost:3000/api/v1/case/single-case/:id
router.get("/single-case/:id", getCaseById); // Get single case by ID

// localhost:3000/api/v1/case/download/:id
router.get("/download/:id", caseDownload); // Download case as PDF (text + images)

// localhost:3000/api/v1/case/update-case/:id
router.patch("/update-case/:id", updateCase); // Update case by ID

// localhost:3000/api/v1/case/remake-case/:id
router.put("/remake-case/:id", upload.any(), remakeCase); // Remake case by ID

// localhost:3000/api/v1/case/delete-case/:id
router.delete("/delete-case/:id", deleteCase); // Delete case by ID

// Case-specific operations
// localhost:3000/api/v1/case/update-case-status/:id
router.patch("/update-case-status/:id", updateCaseStatus); // Update case status

// Query operations
// localhost:3000/api/v1/case/get-cases-by-patient/:patientID
router.get("/get-cases-by-patient/:patientID", getCasesByPatient); // Get cases by patient

// localhost:3000/api/v1/case/get-cases-by-clinic/:clinicId
router.get("/get-cases-by-clinic/:clinicId", getCasesByClinic);

// Workflow Management Routes
// localhost:3000/api/v1/case/admin-approve/:id
router.patch("/admin-approve/:id", adminApproveCase); // Admin accept/reject case

// localhost:3000/api/v1/case/assign-to-technician/:id
router.patch("/assign-to-technician/:id", assignToTechnician); // Lab manager assigns to technician

// localhost:3000/api/v1/case/pending-for-admin
router.get("/pending-for-admin", getPendingCasesForAdmin); // Get pending cases for admin

// localhost:3000/api/v1/case/accepted-for-lab-manager
router.get("/accepted-for-lab-manager", getAcceptedCasesForLabManager); // Get accepted cases for lab manager

// localhost:3000/api/v1/case/technician-cases/:technicianId
router.get("/technician-cases/:technicianId", getCasesForTechnician); // Get cases for technician

// localhost:3000/api/v1/case/archived-cases
router.get("/archived-cases", getArchivedCases); // Get archived cases

// localhost:3000/api/v1/case/inprogress-cases
router.get("/inprogress-cases", getInProgressCases); // Get in-progress cases

// localhost:3000/api/v1/case/completed-cases
router.get("/completed-cases", getCompletedCases);

export default router;

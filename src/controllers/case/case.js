import Case from "../../models/case/caseModal.js";
import mongoose from "mongoose";
import Notification from "../../models/notification/notification.js";
import Clinic from "../../models/clinic/clinic.js";
import { io } from "../../utils/socket.js";
import { jsPDF } from "jspdf"; // optional if you want jsPDF
import PDFDocument from "pdfkit"; // recommended
import { Readable } from "stream";
// Note: Frontend will handle formatting/export (no server-side PDF)

// Utility to prune empty or disabled fields
const pruneFields = (obj) => {
  if (!obj) return null;

  if (Array.isArray(obj)) {
    const filtered = obj
      .map(pruneFields)
      .filter((v) => v !== null && v !== undefined);
    return filtered.length > 0 ? filtered : null;
  }

  if (typeof obj === "object") {
    if (obj.hasOwnProperty("enabled") && obj.enabled === false) return null;

    const prunedObj = {};
    for (const key in obj) {
      const val = pruneFields(obj[key]);
      if (val !== null && val !== undefined) prunedObj[key] = val;
    }
    return Object.keys(prunedObj).length > 0 ? prunedObj : null;
  }

  if (obj === "" || obj === false || obj === null) return null;
  return obj;
};

// Utility to set a nested path (dot notation) to an array value, creating objects along the way
const setDeep = (obj, path, items) => {
  if (!obj || !path) return;
  const parts = path.split(".");
  let curr = obj;
  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    const isLast = i === parts.length - 1;
    if (isLast) {
      const existing = curr[key];
      if (Array.isArray(existing)) {
        curr[key] = [...existing, ...items];
      } else if (existing == null) {
        curr[key] = items;
      } else {
        curr[key] = items;
      }
    } else {
      if (!curr[key] || typeof curr[key] !== "object") curr[key] = {};
      curr = curr[key];
    }
  }
};

export const createCase = async (req, res) => {
  try {
    // Handle optional image uploads
    const images = req.files?.map((item) => ({
      fileUrl: `${process.env.IMAGE_URL}${item.filename}`,
      fileName: item.originalname,
      uploadedAt: new Date(),
    }));

    // Clinic-based validation for dentist users
    if (req.user && req.user.role === "dentist") {
      // Dentists can only create cases for their own clinic
      if (req.body.clinicId && req.user.clinic) {
        if (req.body.clinicId !== req.user.clinic.toString()) {
          return res.status(403).json({
            success: false,
            error: "Access denied",
            message: "Dentists can only create cases for their own clinic",
          });
        }
      }

      // If dentist has no clinic assigned, they cannot create cases
      if (!req.user.clinic) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
          message: "Dentists must be assigned to a clinic to create cases",
        });
      }
    }

    // Validate ObjectId fields if provided
    if (
      req.body.clinicId &&
      !mongoose.Types.ObjectId.isValid(req.body.clinicId)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid clinicId format",
        message: "clinicId must be a valid 24-character MongoDB ObjectId",
        received: req.body.clinicId,
        length: req.body.clinicId.length,
      });
    }
    if (
      req.body.assignedTo &&
      !mongoose.Types.ObjectId.isValid(req.body.assignedTo)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid assignedTo format",
        message: "assignedTo must be a valid 24-character MongoDB ObjectId",
        received: req.body.assignedTo,
        length: req.body.assignedTo.length,
      });
    }

    // Remove empty ObjectId fields
    if (!req.body.clinicId) delete req.body.clinicId;
    if (!req.body.assignedTo) delete req.body.assignedTo;

    // Parse JSON string fields back to objects
    const parsedBody = { ...req.body };
    ["standard", "premium"].forEach((field) => {
      if (parsedBody[field] && typeof parsedBody[field] === "string") {
        try {
          parsedBody[field] = JSON.parse(parsedBody[field]);
        } catch (parseError) {
          console.error(`Error parsing ${field}:`, parseError);
        }
      }
    });

    // ---------------------------
    // Prune Standard / Premium
    // ---------------------------
    let { standard, premium, selectedTier, ...rest } = parsedBody;

    if (selectedTier === "Standard") {
      premium = undefined;
      premium = pruneFields(premium);
    } else if (selectedTier === "Premium") {
      standard = undefined;
      standard = pruneFields(standard);
    }

    const caseDataToCreate = {
      selectedTier,
      standard,
      premium,
      ...rest,
    };

    // Apply uploaded images to a targeted nested attachments array, if provided
    if (images && images.length > 0) {
      const attachmentsPath = req.body.attachmentsPath; // e.g., "standard.CrownBridge.pfm.singleUnitCrown.attachments"
      if (attachmentsPath) {
        setDeep(caseDataToCreate, attachmentsPath, images);
      } else {
        caseDataToCreate.globalAttachments = images;
      }
    }

    // Enforce unique patientID at create-time
    if (caseDataToCreate.patientID) {
      const exists = await Case.exists({
        patientID: caseDataToCreate.patientID,
      });
      if (exists) {
        return res.status(400).json({
          success: false,
          error: "Duplicate patientID",
          message: `patientID '${caseDataToCreate.patientID}' already exists`,
        });
      }
    }

    // Track which UserRole (e.g., dentist) created the case
    if (!caseDataToCreate.createdByUserRole) {
      caseDataToCreate.createdByUserRole =
        req.user?._id || parsedBody.createdByUserRole;
    }

    // Track which User created the case
    if (!caseDataToCreate.createdBy) {
      caseDataToCreate.createdBy = req.user?._id;
    }

    // Automatically set clinicId for users who belong to a clinic (dentists, practice managers, etc.)
    if (!caseDataToCreate.clinicId && req.user?.clinic) {
      caseDataToCreate.clinicId = req.user.clinic;
    }

    // Lifecycle: scanNumber -> Pending admin; otherwise In Progress (admin accepted)
    if (parsedBody.scanNumber && parsedBody.scanNumber.trim() !== "") {
      caseDataToCreate.status = "Pending";
      caseDataToCreate.adminApproval = { status: "Pending" };
      caseDataToCreate.isInProgress = false;
      caseDataToCreate.isCompleted = false;
    } else {
      caseDataToCreate.status = "In Progress";
      caseDataToCreate.adminApproval = {
        status: "Accepted",
        approvedAt: new Date(),
      };
      caseDataToCreate.isInProgress = true;
      caseDataToCreate.isCompleted = false;
    }

    const caseData = await Case.create(caseDataToCreate);

    // Add case to clinic's cases array if clinicId is present
    if (caseData.clinicId) {
      try {
        await Clinic.findByIdAndUpdate(
          caseData.clinicId,
          { $push: { case: caseData._id } },
          { new: true }
        );
      } catch (clinicUpdateErr) {
        console.error("Error adding case to clinic:", clinicUpdateErr);
        // Don't fail the request if clinic update fails, but log it
      }
    }

    // Notification
    try {
      const notif = await Notification.create({
        type: "case_created",
        title: "New Case Created",
        message: `Case ${caseData.caseNumber || caseData._id} created`,
        caseId: caseData._id,
        createdBy: caseData.createdBy || req.user?._id,
        receiverRole: "admin",
      });
      io.emit("notification", {
        _id: notif._id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        caseId: notif.caseId,
        receiverRole: notif.receiverRole,
        createdAt: notif.createdAt,
      });
    } catch (notifyErr) {
      console.error("Error creating case notification:", notifyErr);
    }

    res.status(201).json({
      success: true,
      message: "Case created successfully",
      data: caseData,
    });
  } catch (error) {
    console.error("Error creating case:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: `Invalid ${error.path} format`,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.errors,
    });
  }
};

// Get all cases with filtering, pagination, and sorting
export const getAllCases = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      selectedTier,
      patientID,
      caseNumber,
      clinicId,
      caseType,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (selectedTier) filter.selectedTier = selectedTier;
    if (patientID) filter.patientID = new RegExp(patientID, "i");
    if (caseNumber) filter.caseNumber = new RegExp(caseNumber, "i");
    if (caseType) filter.caseType = caseType; // New | Continuation | Remake

    // Clinic-based filtering for authenticated users
    if (req.user) {
      // Roles that can only see cases from their own clinic
      const clinicRestrictedRoles = [
        "dentist",
        "practicemanager",
        "practicenurse",
      ];

      if (clinicRestrictedRoles.includes(req.user.role)) {
        // For dentist - only show cases created by themselves
        if (req.user.role === "dentist") {
          filter.createdBy = req.user._id;
        } else {
          // For practice manager, practice nurse - filter by their clinic
          if (req.user.clinic) {
            filter.clinicId = req.user.clinic;
          } else {
            // If user has no clinic assigned, return empty results
            return res.status(200).json({
              success: true,
              data: [],
              pagination: {
                currentPage: parseInt(page),
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: parseInt(limit),
              },
            });
          }
        }
      }
      // Lab Manager and Lab Technician can see all cases from all clinics
      // No clinic filtering needed for lab roles

      // For admin/superadmin - respect explicit clinicId filter if provided
      else if (["admin", "superadmin"].includes(req.user.role) && clinicId) {
        filter.clinicId = clinicId;
      }
      // For lab roles (labmanager, labtechnician) - respect explicit clinicId filter if provided
      else if (
        ["labmanager", "labtechnician"].includes(req.user.role) &&
        clinicId
      ) {
        filter.clinicId = clinicId;
      }
    } else if (clinicId) {
      // For unauthenticated requests, respect explicit clinicId filter
      filter.clinicId = clinicId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Execute query
    const cases = await Case.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("clinicId", "name email")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    // Get total count
    const total = await Case.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: cases,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching cases:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get a single case by ID
export const getCaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const caseData = await Case.findById(id)
      .populate("clinicId", "name email phone address")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email");

    if (!caseData) {
      return res.status(404).json({
        success: false,
        error: "Case not found",
      });
    }

    // Clinic-based access control for authenticated users
    if (req.user) {
      // Roles that can only see cases from their own clinic
      const clinicRestrictedRoles = [
        "dentist",
        "practicemanager",
        "practicenurse",
      ];

      if (clinicRestrictedRoles.includes(req.user.role)) {
        // For dentist, practice manager, practice nurse - check if case belongs to their clinic
        if (
          !req.user.clinic ||
          !caseData.clinicId ||
          caseData.clinicId._id.toString() !== req.user.clinic.toString()
        ) {
          return res.status(403).json({
            success: false,
            error: "Access denied",
            message: "You can only view cases from your own clinic",
          });
        }
      }
      // Lab Manager and Lab Technician can view all cases from all clinics
      // No access control needed for lab roles
      // Admin and Superadmin can also view all cases
    }

    res.status(200).json({
      success: true,
      data: caseData,
    });
  } catch (error) {
    console.error("Error fetching case:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update a case by ID
export const updateCase = async (req, res) => {
  try {
    const { id } = req.params;

    // Parse JSON string fields back to objects
    const updateData = { ...req.body };
    const fieldsToParseIfString = ["standard", "premium"];

    fieldsToParseIfString.forEach((field) => {
      if (updateData[field] && typeof updateData[field] === "string") {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (parseError) {
          console.error(`Error parsing ${field}:`, parseError);
        }
      }
    });

    const updatedCase = await Case.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("clinicId", "name email")
      .populate("assignedTo", "name email");

    if (!updatedCase) {
      return res.status(404).json({
        success: false,
        error: "Case not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Case updated successfully",
      data: updatedCase,
    });
  } catch (error) {
    console.error("Error updating case:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.errors,
    });
  }
};

// Delete a case by ID
export const deleteCase = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCase = await Case.findByIdAndDelete(id);

    if (!deletedCase) {
      return res.status(404).json({
        success: false,
        error: "Case not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Case deleted successfully",
      data: deletedCase,
    });
  } catch (error) {
    console.error("Error deleting case:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update case status
export const updateCaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "Pending",
      "In Progress",
      "Completed",
      "Cancelled",
      "On Hold",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const updatedCase = await Case.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedCase) {
      return res.status(404).json({
        success: false,
        error: "Case not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Case status updated successfully",
      data: updatedCase,
    });
  } catch (error) {
    console.error("Error updating case status:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get cases by patient ID
export const getCasesByPatient = async (req, res) => {
  try {
    const { patientID } = req.params;
    const { caseType, page = 1, limit = 10 } = req.query;

    const filter = { patientID };
    if (caseType) filter.caseType = caseType; // New | Continuation | Remake

    // Clinic-based filtering for authenticated users
    if (req.user) {
      // Roles that can only see cases from their own clinic
      const clinicRestrictedRoles = [
        "dentist",
        "practicemanager",
        "practicenurse",
      ];

      if (clinicRestrictedRoles.includes(req.user.role)) {
        // For dentist, practice manager, practice nurse - filter by their clinic
        if (req.user.clinic) {
          filter.clinicId = req.user.clinic;
        } else {
          // If user has no clinic assigned, return empty results
          return res.status(200).json({
            success: true,
            count: 0,
            data: [],
            pagination: {
              currentPage: parseInt(page),
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: parseInt(limit),
            },
          });
        }
      }
      // Lab Manager and Lab Technician can see all cases from all clinics
      // No clinic filtering needed for lab roles
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Case.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("clinicId", "name")
        .populate("assignedTo", "name"),
      Case.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching patient cases:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get cases by clinic
export const getCasesByClinic = async (req, res) => {
  try {
    const { clinicId } = req.params;

    // First try to get clinic and populate its cases
    const clinic = await Clinic.findById(clinicId).populate({
      path: "case",
      populate: [
        { path: "assignedTo", select: "name email" },
        { path: "createdBy", select: "name email" },
      ],
    });

    if (!clinic) {
      return res.status(404).json({
        success: false,
        error: "Clinic not found",
      });
    }

    // Clinic-based access control for authenticated users
    if (req.user) {
      // Roles that can only see cases from their own clinic
      const clinicRestrictedRoles = [
        "dentist",
        "practicemanager",
        "practicenurse",
      ];

      if (clinicRestrictedRoles.includes(req.user.role)) {
        // For dentist, practice manager, practice nurse - check if they belong to this clinic
        if (!req.user.clinic || req.user.clinic.toString() !== clinicId) {
          return res.status(403).json({
            success: false,
            error: "Access denied",
            message: "You can only view cases from your own clinic",
          });
        }
      }
      // Lab Manager and Lab Technician can view all cases from all clinics
      // No access control needed for lab roles
      // Admin and Superadmin can also view all clinics
    }

    res.status(200).json({
      success: true,
      count: clinic.case.length,
      data: clinic.case,
      clinicInfo: {
        name: clinic.name,
        email: clinic.email,
        status: clinic.clinicStatus,
      },
    });
  } catch (error) {
    console.error("Error fetching clinic cases:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get case statistics
export const getCaseStats = async (req, res) => {
  try {
    const { clinicId } = req.query;
    const filter = clinicId ? { clinicId } : {};

    const stats = await Case.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const tierStats = await Case.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$selectedTier",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalCases = await Case.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        total: totalCases,
        byStatus: stats,
        byTier: tierStats,
      },
    });
  } catch (error) {
    console.error("Error fetching case stats:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Remake a case - Find case by ID, clear all data, and create new case
export const remakeCase = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the existing case
    const existingCase = await Case.findById(id);

    if (!existingCase) {
      return res.status(404).json({
        success: false,
        error: "Case not found",
      });
    }

    // Handle optional image uploads
    const images = req.files?.map((item) => ({
      fileUrl: `${process.env.IMAGE_URL}${item.filename}`,
      fileName: item.originalname,
      uploadedAt: new Date(),
    }));

    // Parse JSON string fields back to objects
    const parsedBody = { ...req.body };
    const fieldsToParseIfString = ["standard", "premium"];

    fieldsToParseIfString.forEach((field) => {
      if (parsedBody[field] && typeof parsedBody[field] === "string") {
        try {
          parsedBody[field] = JSON.parse(parsedBody[field]);
        } catch (parseError) {
          console.error(`Error parsing ${field}:`, parseError);
        }
      }
    });

    // Validate ObjectId fields if provided
    if (parsedBody.clinicId) {
      if (!mongoose.Types.ObjectId.isValid(parsedBody.clinicId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid clinicId format",
        });
      }
    }

    if (parsedBody.assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(parsedBody.assignedTo)) {
        return res.status(400).json({
          success: false,
          error: "Invalid assignedTo format",
        });
      }
    }

    // Remove empty ObjectId fields
    if (parsedBody.clinicId === "" || parsedBody.clinicId === null) {
      delete parsedBody.clinicId;
    }
    if (parsedBody.assignedTo === "" || parsedBody.assignedTo === null) {
      delete parsedBody.assignedTo;
    }

    // Prepare new case data (clearing all old data)
    const remakeData = {
      ...parsedBody,
      caseType: "Remake", // Set case type as Remake
    };

    // Apply uploaded images to a targeted nested attachments array, if provided
    if (images && images.length > 0) {
      const attachmentsPath = req.body.attachmentsPath; // e.g., "standard.CrownBridge.pfm.singleUnitCrown.attachments"
      if (attachmentsPath) {
        setDeep(remakeData, attachmentsPath, images);
      } else {
        remakeData.globalAttachments = images;
      }
    }

    // Update the case with new data (replacing all fields)
    const remadeCase = await Case.findByIdAndUpdate(
      id,
      { $set: remakeData },
      { new: true, runValidators: true, overwrite: false }
    )
      .populate("clinicId", "name email")
      .populate("assignedTo", "name email");

    res.status(200).json({
      success: true,
      message: "Case remade successfully",
      data: remadeCase,
    });
  } catch (error) {
    console.error("Error remaking case:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
      details: error.errors,
    });
  }
};

// Admin: Accept or Reject Case
export const adminApproveCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason, adminId } = req.body;

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        error: "Action must be 'accept' or 'reject'",
      });
    }

    if (action === "reject" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        error: "Rejection reason is required",
      });
    }

    const updateData = {
      "adminApproval.status": action === "accept" ? "Accepted" : "Rejected",
      "adminApproval.approvedBy": adminId,
      "adminApproval.approvedAt": new Date(),
      status: action === "accept" ? "In Progress" : "Rejected",
    };

    if (action === "accept") {
      updateData.isInProgress = true;
      updateData.isCompleted = false;
    }

    if (action === "reject") {
      updateData["adminApproval.rejectionReason"] = rejectionReason;
    }

    const updatedCase = await Case.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("adminApproval.approvedBy", "name email")
      .populate("clinicId", "name email");

    if (!updatedCase) {
      return res.status(404).json({
        success: false,
        error: "Case not found",
      });
    }

    // Return data only when action is accept; omit data on reject
    if (action === "accept") {
      return res.status(200).json({
        success: true,
        message: `Case ${action}ed successfully`,
        data: updatedCase,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Case ${action}ed successfully`,
    });
  } catch (error) {
    console.error("Error approving/rejecting case:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Lab Manager: Assign Case to Technician
export const assignToTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { technicianId, labManagerId } = req.body;

    if (!technicianId) {
      return res.status(400).json({
        success: false,
        error: "Technician ID is required",
      });
    }

    const caseData = await Case.findById(id);

    if (!caseData) {
      return res.status(404).json({
        success: false,
        error: "Case not found",
      });
    }

    if (caseData.adminApproval.status !== "Accepted") {
      return res.status(400).json({
        success: false,
        error: "Case must be accepted by admin first",
      });
    }

    const updateData = {
      assignedTechnician: technicianId,
      "labManagerAssignment.assignedBy": labManagerId,
      "labManagerAssignment.assignedAt": new Date(),
      status: "In Progress",
      isInProgress: false,
      isCompleted: true,
      isArchived: false,
    };

    const updatedCase = await Case.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("assignedTechnician", "name email role")
      .populate("labManagerAssignment.assignedBy", "name email")
      .populate("clinicId", "name email");

    res.status(200).json({
      success: true,
      message: "Case assigned to technician successfully",
      data: updatedCase,
    });
  } catch (error) {
    console.error("Error assigning to technician:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get Pending Cases for Admin
export const getPendingCasesForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const cases = await Case.find({
      "adminApproval.status": "Pending",
      status: "Pending",
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("clinicId", "name email")
      .populate("createdBy", "name email");

    const total = await Case.countDocuments({
      "adminApproval.status": "Pending",
      status: "Pending",
    });

    res.status(200).json({
      success: true,
      data: cases,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching pending cases:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get Accepted Cases for Lab Manager
export const getAcceptedCasesForLabManager = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const cases = await Case.find({
      "adminApproval.status": "Accepted",
      status: "Accepted",
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("clinicId", "name email")
      .populate("adminApproval.approvedBy", "name email");

    const total = await Case.countDocuments({
      "adminApproval.status": "Accepted",
      status: "Accepted",
    });

    res.status(200).json({
      success: true,
      data: cases,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching accepted cases:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get Cases Assigned to Technician
export const getCasesForTechnician = async (req, res) => {
  try {
    const { technicianId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const cases = await Case.find({
      assignedTechnician: technicianId,
      status: "In Progress",
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("clinicId", "name email")
      .populate("labManagerAssignment.assignedBy", "name email");

    const total = await Case.countDocuments({
      assignedTechnician: technicianId,
      status: "In Progress",
    });

    res.status(200).json({
      success: true,
      data: cases,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching technician cases:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get Archived Cases

export const getInProgressCases = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const cases = await Case.find({
      isCompleted: false,
      isInProgress: true,
    })

      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("clinicId", "name email")
      .populate("assignedTechnician", "name email");
    const total = await Case.countDocuments({
      isCompleted: false,
      isInProgress: true,
    });
    res.status(200).json({
      success: true,
      data: cases,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching in-progress cases:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getCompletedCases = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const cases = await Case.find({
      isInProgress: false,
      isCompleted: true,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("clinicId", "name email")
      .populate("assignedTechnician", "name email");

    const total = await Case.countDocuments({
      isInProgress: false,
      isCompleted: true,
    });

    res.status(200).json({
      success: true,
      data: cases,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching completed cases:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const archiveCompletedCasesAfterTwoWeeks = async () => {
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  return Case.updateMany(
    {
      isCompleted: true,
      isArchived: false,
      completedAt: { $lte: cutoff },
    },
    {
      status: "Archived",
      isInProgress: false,
      isCompleted: false,
      isArchived: true,
      archiveDate: new Date(),
    }
  );
};

export const getArchivedCases = async (req, res) => {
  try {
    await archiveCompletedCasesAfterTwoWeeks();
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const cases = await Case.find({
      isArchived: true,
    })
      .sort({ archiveDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("clinicId", "name email")
      .populate("assignedTechnician", "name email");

    const total = await Case.countDocuments({
      isArchived: true,
    });

    res.status(200).json({
      success: true,

      data: cases,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching archived cases:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const caseDownload = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id).lean();
    if (!caseData) {
      return res.status(404).json({
        message: "Case not found",
        error: "Case not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Case downloaded successfully",
      data: caseData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Case downloading failed",
      error: error.message,
    });
  }
};

export const getPersonalCase = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      selectedTier,
      patientID,
      caseNumber,
      caseType,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object for dentist's personal cases
    const filter = {
      createdBy: req.user._id, // Only show cases created by this dentist
    };

    // Add optional filters
    if (status) filter.status = status;
    if (selectedTier) filter.selectedTier = selectedTier;
    if (patientID) filter.patientID = new RegExp(patientID, "i");
    if (caseNumber) filter.caseNumber = new RegExp(caseNumber, "i");
    if (caseType) filter.caseType = caseType;

    // Ensure dentist can only see cases from their own clinic
    if (req.user.clinic) {
      filter.clinicId = req.user.clinic;
    } else {
      // If dentist has no clinic assigned, return empty results
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: parseInt(limit),
        },
      });
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Execute query
    const cases = await Case.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("clinicId", "name email phone address")
      .populate("assignedTo", "name email role")
      .populate("assignedTechnician", "name email role");

    // Get total count
    const total = await Case.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: cases,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching personal cases:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

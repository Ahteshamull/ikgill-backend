import Case from "../../models/case/caseModal.js";
import mongoose from "mongoose";

// Create a new case
export const createCase = async (req, res) => {
  try {
    // Handle optional image uploads
    const images = req.files?.map((item) => ({
      fileUrl: `${process.env.IMAGE_URL}${item.filename}`,
      fileName: item.originalname,
      uploadedAt: new Date(),
    }));

    // Validate ObjectId fields if provided
    if (req.body.clinicId) {
      if (!mongoose.Types.ObjectId.isValid(req.body.clinicId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid clinicId format",
          message: "clinicId must be a valid 24-character MongoDB ObjectId",
          received: req.body.clinicId,
          length: req.body.clinicId.length,
        });
      }
    }

    if (req.body.assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(req.body.assignedTo)) {
        return res.status(400).json({
          success: false,
          error: "Invalid assignedTo format",
          message: "assignedTo must be a valid 24-character MongoDB ObjectId",
          received: req.body.assignedTo,
          length: req.body.assignedTo.length,
        });
      }
    }

    // Remove empty ObjectId fields
    if (req.body.clinicId === "" || req.body.clinicId === null) {
      delete req.body.clinicId;
    }
    if (req.body.assignedTo === "" || req.body.assignedTo === null) {
      delete req.body.assignedTo;
    }

    // Parse JSON string fields back to objects
    const parsedBody = { ...req.body };
    const fieldsToParseIfString = ['standard', 'premium'];
    
    fieldsToParseIfString.forEach(field => {
      if (parsedBody[field] && typeof parsedBody[field] === 'string') {
        try {
          parsedBody[field] = JSON.parse(parsedBody[field]);
        } catch (parseError) {
          console.error(`Error parsing ${field}:`, parseError);
        }
      }
    });

    // Prepare case data
    const caseDataToCreate = {
      ...parsedBody,
      // Add images to globalAttachments if files were uploaded
      ...(images && images.length > 0 && { globalAttachments: images }),
    };

    // Track which UserRole (e.g., dentist) created the case
    if (!caseDataToCreate.createdByUserRole) {
      caseDataToCreate.createdByUserRole = req.user?._id || parsedBody.createdByUserRole;
    }

    // Check if scanNumber is provided
    if (parsedBody.scanNumber && parsedBody.scanNumber.trim() !== "") {
      // If scanNumber exists, case goes to Admin (Pending)
      caseDataToCreate.status = "Pending";
      caseDataToCreate.adminApproval = {
        status: "Pending",
      };
    } else {
      // If no scanNumber, case goes directly to Lab Manager (Accepted)
      caseDataToCreate.status = "Accepted";
      caseDataToCreate.adminApproval = {
        status: "Accepted",
        approvedAt: new Date(),
      };
    }

    const caseData = await Case.create(caseDataToCreate);
    res.status(201).json({
      success: true,
      message: "Case created successfully",
      data: caseData,
    });
  } catch (error) {
    console.error("Error creating case:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }

    // Handle cast errors
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
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (selectedTier) filter.selectedTier = selectedTier;
    if (patientID) filter.patientID = new RegExp(patientID, "i");
    if (caseNumber) filter.caseNumber = new RegExp(caseNumber, "i");
    if (clinicId) filter.clinicId = clinicId;

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Execute query
    const cases = await Case.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("clinicId", "name email")
      .populate("assignedTo", "name email");

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
      error: error.message 
    });
  }
};

// Get a single case by ID
export const getCaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const caseData = await Case.findById(id)
      .populate("clinicId", "name email phone address")
      .populate("assignedTo", "name email role");

    if (!caseData) {
      return res.status(404).json({ 
        success: false,
        error: "Case not found" 
      });
    }

    res.status(200).json({ 
      success: true,
      data: caseData 
    });
  } catch (error) {
    console.error("Error fetching case:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update a case by ID
export const updateCase = async (req, res) => {
  try {
    const { id } = req.params;

    // Parse JSON string fields back to objects
    const updateData = { ...req.body };
    const fieldsToParseIfString = ['standard', 'premium'];
    
    fieldsToParseIfString.forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
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
        error: "Case not found" 
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
      details: error.errors 
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
        error: "Case not found" 
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
      error: error.message 
    });
  }
};

// Update case status
export const updateCaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "In Progress", "Completed", "Cancelled", "On Hold"];
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
        error: "Case not found" 
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
      error: error.message 
    });
  }
};

// Assign case to a technician
export const assignCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const updatedCase = await Case.findByIdAndUpdate(
      id,
      { assignedTo },
      { new: true }
    ).populate("assignedTo", "name email role");

    if (!updatedCase) {
      return res.status(404).json({ 
        success: false,
        error: "Case not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Case assigned successfully",
      data: updatedCase,
    });
  } catch (error) {
    console.error("Error assigning case:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};



// Get cases by patient ID
export const getCasesByPatient = async (req, res) => {
  try {
    const { patientID } = req.params;

    const cases = await Case.find({ patientID })
      .sort({ createdAt: -1 })
      .populate("clinicId", "name")
      .populate("assignedTo", "name");

    res.status(200).json({
      success: true,
      count: cases.length,
      data: cases,
    });
  } catch (error) {
    console.error("Error fetching patient cases:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get cases by clinic
export const getCasesByClinic = async (req, res) => {
  try {
    const { clinicId } = req.params;

    const cases = await Case.find({ clinicId })
      .sort({ createdAt: -1 })
      .populate("assignedTo", "name email");

    res.status(200).json({
      success: true,
      count: cases.length,
      data: cases,
    });
  } catch (error) {
    console.error("Error fetching clinic cases:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
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
      error: error.message 
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
    const fieldsToParseIfString = ['standard', 'premium'];
    
    fieldsToParseIfString.forEach(field => {
      if (parsedBody[field] && typeof parsedBody[field] === 'string') {
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
      // Add images to globalAttachments if files were uploaded
      ...(images && images.length > 0 && { globalAttachments: images }),
    };

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
      status: action === "accept" ? "Accepted" : "Rejected",
    };

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

    res.status(200).json({
      success: true,
      message: `Case ${action}ed successfully`,
      data: updatedCase,
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

// Archive Cases Older Than 10 Days
export const archiveOldCases = async (req, res) => {
  try {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const result = await Case.updateMany(
      {
        status: "Completed",
        isArchived: false,
        updatedAt: { $lte: tenDaysAgo },
      },
      {
        $set: {
          status: "Archived",
          isArchived: true,
          archiveDate: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} cases archived successfully`,
      data: {
        archivedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Error archiving cases:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get Archived Cases
export const getArchivedCases = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const cases = await Case.find({
      isArchived: true,
      status: "Archived",
    })
      .sort({ archiveDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("clinicId", "name email")
      .populate("assignedTechnician", "name email");

    const total = await Case.countDocuments({
      isArchived: true,
      status: "Archived",
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

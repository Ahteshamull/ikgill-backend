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

    // Prepare case data
    const caseDataToCreate = {
      ...req.body,
      // Add images to globalAttachments if files were uploaded
      ...(images && images.length > 0 && { globalAttachments: images }),
    };

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

    const updatedCase = await Case.findByIdAndUpdate(
      id,
      { $set: req.body },
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

// Add a note to a case
export const addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { author, content } = req.body;

    if (!author || !content) {
      return res.status(400).json({
        success: false,
        error: "Author and content are required",
      });
    }

    const updatedCase = await Case.findByIdAndUpdate(
      id,
      {
        $push: {
          notes: {
            author,
            content,
            createdAt: new Date(),
          },
        },
      },
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
      message: "Note added successfully",
      data: updatedCase,
    });
  } catch (error) {
    console.error("Error adding note:", error);
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

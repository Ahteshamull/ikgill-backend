import clinicModel from "../../models/clinic/clinic.js";
import Case from "../../models/case/caseModal.js";
import mongoose from "mongoose";

export const createClinic = async (req, res) => {
  try {
    const { name, email, details } = req.body;
    // Prevent duplicate emails (friendly 400 before DB unique index fires)
    if (email) {
      const exists = await clinicModel.exists({
        email: email.trim().toLowerCase(),
      });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Clinic email already exists",
          field: "email",
        });
      }
    }
    const clinic = await clinicModel.create({
      name,
      email: email?.trim().toLowerCase(),
      details,
    });
    return res.status(201).json({
      success: true,
      message: "Clinic created successfully",
      data: clinic,
    });
  } catch (error) {
    // Handle duplicate key from unique index as well (race condition safety)
    if (error?.code === 11000 && error?.keyPattern?.email) {
      return res.status(400).json({
        success: false,
        message: "Clinic email already exists",
        field: "email",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Clinic creation failed",
      error: error.message,
    });
  }
};
export const getClinic = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { email } = req.query;

    const filter = {};
    if (email) {
      // Allow partial email search, case-insensitive
      filter.email = { $regex: email, $options: "i" };
    }

    const totalClinics = await clinicModel.countDocuments(filter);
    const clinic = await clinicModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalClinics / limit);

    return res.status(200).json({
      success: true,
      message: "Clinic fetched successfully",
      data: clinic,
      pagination: {
        currentPage: page,
        totalPages,
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Clinic fetching failed",
      error: error.message,
    });
  }
};
export const updateClinic = async (req, res) => {
  try {
    const { name, email, details } = req.body;
    // If updating email, ensure uniqueness excluding current doc
    if (email) {
      const exists = await clinicModel.exists({
        email: email.trim().toLowerCase(),
        _id: { $ne: req.params.id },
      });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Clinic email already exists",
          field: "email",
        });
      }
    }
    const clinic = await clinicModel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email: email?.trim().toLowerCase(),
        details,
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Clinic updated successfully",
      data: clinic,
    });
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.email) {
      return res.status(400).json({
        success: false,
        message: "Clinic email already exists",
        field: "email",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Clinic updating failed",
      error: error.message,
    });
  }
};
export const deleteClinic = async (req, res) => {
  try {
    const clinic = await clinicModel.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Clinic deleted successfully",
      data: clinic,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Clinic deleting failed",
      error: error.message,
    });
  }
};
export const singleClinicById = async (req, res) => {
  try {
    const clinic = await clinicModel.findById(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Clinic fetched successfully",
      data: clinic,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Clinic fetching failed",
      error: error.message,
    });
  }
};
export const changeClinicStatus = async (req, res) => {
  try {
    const clinic = await clinicModel.findByIdAndUpdate(
      req.params.id,
      {
        clinicStatus: req.body.clinicStatus,
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Clinic status changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Clinic status changing failed",
      error: error.message,
    });
  }
};

export const getCaseByClinicId = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    console.log("=== DEBUG INFO ===");
    console.log("Request params:", req.params);
    console.log("Getting cases for clinicId:", id);
    console.log("ClinicId type:", typeof id);
    console.log("ClinicId length:", id?.length);
    console.log("User info:", req.user);
    console.log("==================");

    // Check if clinicId is provided
    if (!id) {
      console.log("No clinicId provided in params");
      return res.status(400).json({
        success: false,
        message: "Clinic ID is required",
      });
    }

    // Check if clinicId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid ObjectId format:", id);
      return res.status(400).json({
        success: false,
        message: "Invalid clinic ID format",
      });
    }

    // Check if clinic exists
    const clinic = await clinicModel.findById(id);
    if (!clinic) {
      console.log("Clinic not found with ID:", id);

      // Try to find all clinics to see what's available
      const allClinics = await clinicModel.find({}, "_id name email");
      console.log(
        "Available clinics:",
        allClinics.map((c) => ({ id: c._id, name: c.name }))
      );

      return res.status(404).json({
        success: false,
        message: "Clinic not found",
        debug: {
          searchedId: id,
          availableClinics: allClinics.map((c) => ({
            id: c._id,
            name: c.name,
          })),
        },
      });
    }

    console.log("Clinic found:", clinic.name);

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
        if (!req.user.clinic || req.user.clinic.toString() !== id) {
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

    // Get cases for the clinic
    const [cases, total] = await Promise.all([
      Case.find({ clinicId: id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email"),
      Case.countDocuments({ clinicId: id }),
    ]);

    res.status(200).json({
      success: true,
      count: cases.length,
      data: cases,
      clinicInfo: {
        name: clinic.name,
        email: clinic.email,
        status: clinic.clinicStatus,
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching cases by clinic ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cases",
      error: error.message,
    });
  }
};

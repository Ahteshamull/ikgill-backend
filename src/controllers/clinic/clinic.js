import clinicModel from "../../models/clinic/clinic.js";

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


import userModel from "../../models/auth/userModal.js";

export const getAllAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalAdmins = await userModel.countDocuments();
    const admin = await userModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalAdmins / limit);

    res.status(200).json({
      pagination: {
        currentPage: page,
        totalPages,
        totalAdmins,
        limit,
      },
      success: true,
      message: "Admins fetched successfully",
      data: admin.map((admin) => {
        const adminSafe = admin.toObject ? admin.toObject() : { ...admin };
        delete adminSafe.password;
        return adminSafe;
      }),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get admin",
    });
  }
};

export const getSingleAdmin = async (req, res) => {
  try {
    const admin = await userModel.findById(req.params.id);
    const adminSafe = admin.toObject ? admin.toObject() : { ...admin };
    delete adminSafe.password;
    res.status(200).json({
      success: true,
      message: "Admin fetched successfully",
      data: adminSafe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get admin",
    });
  }
};

export const updateAdmin = async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const admin = await userModel.findByIdAndUpdate(
      req.params.id,
      { name, phone },
      { new: true, runValidators: true }
    );
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    const adminSafe = admin.toObject ? admin.toObject() : { ...admin };
    delete adminSafe.password;
    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: adminSafe,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update admin", message: error.message });
  }
};
export const updateAdminImage = async (req, res) => {
  const uploadedFiles = req.files?.length
    ? req.files
    : req.file
    ? [req.file]
    : [];
  const images = uploadedFiles.map(
    (item) => `${process.env.IMAGE_URL}${item.filename}`
  );
  if (images.length === 0) {
    return res
      .status(400)
      .json({ error: "No image provided", message: "Upload an image file" });
  }
  try {
    const admin = await userModel.findByIdAndUpdate(
      req.params.id,
      { image: images[0] },
      { new: true }
    );
    const adminSafe = admin.toObject ? admin.toObject() : { ...admin };
    delete adminSafe.password;
    res.status(200).json({
      message: "Admin image updated successfully",
      data: adminSafe,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update admin image", message: error.message });
  }
};

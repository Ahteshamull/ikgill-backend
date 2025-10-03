import fs from "fs";
import path from "path";
import userRoleModel from "../../models/users/userRoleModal.js";

export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      clinic,
      lab,
      caseListAccess,
      archivesAccess,
      sendMessagesToDoctors,
      qualityCheckPermission,
    } = req.body;
    const images = req.files.map(
      (item) => `${process.env.IMAGE_URL}${item.filename}`
    );
    const user = await userRoleModel.create({
      name,
      email,
      phone,
      role,
      clinic,
      lab,
      image: images,
      caseListAccess,
      archivesAccess,
      sendMessagesToDoctors,
      qualityCheckPermission,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User creation failed",
      error: error.message,
    });
  }
};
export const getAllUser = async (req, res) => {
  try {
    const user = await userRoleModel.find();
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User fetching failed",
      error: error.message,
    });
  }
};
export const getSingleUser = async (req, res) => {
  try {
    const user = await userRoleModel.findById(req.params.id);
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User fetching failed",
      error: error.message,
    });
  }
};
export const updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, clinic, lab } = req.body;
    const images = req.files.map(
      (item) => `${process.env.IMAGE_URL}${item.filename}`
    );
    const user = await userRoleModel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        role,
        clinic,
        lab,
        image: images,
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User updating failed",
      error: error.message,
    });
  }
};
export const deleteUser = async (req, res) => {
  try {
    const user = await userRoleModel.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User deleting failed",
      error: error.message,
    });
  }
};
export const changeUserStatus = async (req, res) => {
  try {
    const user = await userRoleModel.findByIdAndUpdate(
      req.params.id,
      {
        userStatus: req.body.userStatus,
      },
      
    );
    return res.status(200).json({
      success: true,
      message: "User status changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User status changing failed",
      error: error.message,
    });
  }
};
export const changeUserImage = async (req, res) => {
  const images = req.files.map(
    (item) => `${process.env.IMAGE_URL}${item.filename}`
  );
  try {
    const user = await userRoleModel.findByIdAndUpdate(
      req.params.id,
      {
        image: images,
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "User image changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User image changing failed",
      error: error.message,
    });
  }
};
export const allBlockUserList = async (req, res) => {
  try {
    const user = await userRoleModel.find({ userStatus: "inactive" });
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User fetching failed",
      error: error.message,
    });
  }
};
// export const changeUserStatus = async (req, res) => {
//   try {
//     const user = await userRoleModel.findByIdAndUpdate(
//       req.params.id,
//       {
//         userStatus: "active",
//       },
//       { new: true }
//     );
//     return res.status(200).json({
//       success: true,
//       message: "User status changed successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "User status changing failed",
//       error: error.message,
//     });
//   }
// };

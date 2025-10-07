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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await userRoleModel.countDocuments();
    const user = await userRoleModel.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
      pagination: {
        currentPage: page,
        totalPages,
        limit,
      },
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalBlockedUsers = await userRoleModel.countDocuments({ userStatus: "inactive" });
    const user = await userRoleModel.find({ userStatus: "inactive" })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalBlockedUsers / limit);

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
      pagination: {
        currentPage: page,
        totalPages,
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User fetching failed",
      error: error.message,
    });
  }
};

export const getUserCountByRole = async (req, res) => {
  try {
    const userCounts = await userRoleModel.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          role: "$_id",
          count: 1,
        },
      },
      {
        $sort: { role: 1 },
      },
    ]);

    // Calculate total users
    const totalUsers = userCounts.reduce((sum, item) => sum + item.count, 0);

    return res.status(200).json({
      success: true,
      message: "User count by role fetched successfully",
      data: {
        userCounts,
        totalUsers,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user count by role",
      error: error.message,
    });
  }
};

export const getUserRatioByMonth = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const userStats = await userRoleModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${targetYear}-01-01`),
            $lte: new Date(`${targetYear}-12-31T23:59:59`),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    // Create array with all 12 months
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyData = monthNames.map((month, index) => {
      const monthData = userStats.find((stat) => stat._id.month === index + 1);
      return {
        month,
        users: monthData ? monthData.count : 0,
      };
    });

    const totalUsers = monthlyData.reduce((sum, item) => sum + item.users, 0);

    return res.status(200).json({
      success: true,
      message: "User ratio by month fetched successfully",
      data: {
        year: targetYear,
        totalUsers,
        monthlyData,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user ratio by month",
      error: error.message,
    });
  }
};

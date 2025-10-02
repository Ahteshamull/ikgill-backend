import fs from "fs";
import path from "path";
import userRoleModel from "../../models/users/userRoleModal.js";

const filePath = process.env.IMAGE_URL;

export const createUser = async (req, res) => {
  try {
    const { name, email, phone, role, clinic, lab } = req.body;
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

import {
 
  createCategoryService,
  deleteCategoryService,
  getAllCategoryService,
  updateCategoryService,

} from "../services/Category.service.js";

// Create Style
export const createCategoryController = async (req, res) => {
  try {
   

    const style = await createCategoryService(req.body, req.headers.user_id);
    res.status(201).json({ success: true, style });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Style
export const updateCategoryController = async (req, res) => {
  try {
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ success: false, message: "Only admins can edit styles" });
    // }

    const style = await updateCategoryService(req.params.id, req.body);
    if (!style) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, style });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Style
export const deleteCategoryController = async (req, res) => {
  try {
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ success: false, message: "Only admins can delete styles" });
    // }

    const style = await deleteCategoryService(req.params.id);
    if (!style) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All categories (Users + Admin)
export const getAllCategoryController = async (req, res) => {
  try {
    const categories = await getAllCategoryService();
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


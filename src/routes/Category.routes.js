import express from "express";
import {

  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
  getAllCategoryController
} from "../controllers/category.controller.js";
import { authChecks } from "../middlewares/authForAdmin.middleware.js";

const CategoryRoute = express.Router();

// Public: Get styles
CategoryRoute.get("/getAllCategory", getAllCategoryController);

// Admin only: Manage styles
CategoryRoute.post("/createCategory", authChecks, createCategoryController);
CategoryRoute.put("/UpdateCategory/:id", authChecks, updateCategoryController);
CategoryRoute.delete("/DeleteCategory/:id",authChecks, deleteCategoryController);

export default CategoryRoute;

import express from "express";
import {
  createStyleController,
  updateStyleController,
  deleteStyleController,
  getAllStylesController,
  countStyleUsageController
} from "../controllers/style.controller.js";
import { authCheck } from "../middlewares/auth.middleware.js";
import { authChecks } from "../middlewares/authForAdmin.middleware.js";

const StyleRoute = express.Router();

// Public: Get styles
StyleRoute.get("/getAllStyle", getAllStylesController);

// Admin only: Manage styles
StyleRoute.post("/createStyle", authChecks, createStyleController);
StyleRoute.put("/UpdateStyle/:id", authChecks, updateStyleController);
StyleRoute.delete("/DeleteStyle/:id",authChecks, deleteStyleController);
StyleRoute.get("/CountEachStyle",authChecks, countStyleUsageController);

export default StyleRoute;

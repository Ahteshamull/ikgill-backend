import express from "express";
import { authCheck } from "../middlewares/auth.middleware.js";
import { createPlannerController, deletePlannerController, getAllPlannersController, getPlannerByIdController, updatePlannerTimeController } from "../controllers/Planner.controller.js";


const PlannerRoutes = express.Router();

PlannerRoutes.post("/createPlanner",authCheck, createPlannerController)

PlannerRoutes.get("/getAllPlanner",authCheck, getAllPlannersController)

PlannerRoutes.get("/getSpecificPlanner/:id",authCheck, getPlannerByIdController)

PlannerRoutes.post("/UpdatePlannerTime/:id",authCheck, updatePlannerTimeController)

PlannerRoutes.delete("/deletePlanner/:id",authCheck, deletePlannerController)


export default PlannerRoutes;
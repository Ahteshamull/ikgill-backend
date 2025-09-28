import express from "express";

import { authCheck } from "../middlewares/auth.middleware.js";
import { creatMetarialsController, deletMetarialsController, getAllMetarialController, updateMetarialsController } from "../controllers/Metarial.controller.js";
import { authChecks } from "../middlewares/authForAdmin.middleware.js";

const MetarialRoute = express.Router();

// Public: Get styles
MetarialRoute.get("/getAllMetarial", getAllMetarialController);

// Admin only: Manage styles
MetarialRoute.post("/createMetarial", authChecks, creatMetarialsController);
MetarialRoute.put("/UpdateMetarial/:id", authChecks, updateMetarialsController);
MetarialRoute.delete("/DeleteMetarial/:id",authChecks, deletMetarialsController);

export default MetarialRoute;

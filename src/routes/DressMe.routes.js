import express from "express";
import * as DressMeController from "../controllers/DressMe.controller.js";
import { authCheck } from "../middlewares/auth.middleware.js"
const DressMeRoutes = express.Router();





DressMeRoutes.post("/createDressMe",authCheck, DressMeController.createDressMe);
DressMeRoutes.put("/updateDressMe:id",authCheck, DressMeController.editDressMe);
DressMeRoutes.delete("/deleteDressMe/:id",authCheck, DressMeController.deleteDressMe);
DressMeRoutes.get("/showDressMe",authCheck, DressMeController.getAllDressMe);
DressMeRoutes.get("/DetailsDressMe/:id",authCheck, DressMeController.getDressMeDetailsController);




export default DressMeRoutes;
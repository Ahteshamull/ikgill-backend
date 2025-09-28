import express from "express";
import * as lookbookController from "../controllers/Lookbook.controller.js";
import { authCheck } from "../middlewares/auth.middleware.js";

const LookbookRoutes = express.Router();

LookbookRoutes.post("/CreateLookBook", authCheck, lookbookController.createLookbook);
LookbookRoutes.get("/GetAllLookbook", authCheck, lookbookController.getLookbooks);
LookbookRoutes.get("/GetLookbookById/:id", authCheck, lookbookController.getLookbookById);
LookbookRoutes.patch("/UpdateLookbookById/:id", authCheck, lookbookController.updateLookbook);
LookbookRoutes.delete("/DeleteLookbook/:id", authCheck, lookbookController.deleteLookbook);
LookbookRoutes.patch("/AdditemstoLookbook/:id", authCheck, lookbookController.addToLookbook);
LookbookRoutes.patch("/removeItemsOrOutfitToLookbook/:lookbookId", authCheck, lookbookController.removeFromLookbookController);


export default LookbookRoutes;

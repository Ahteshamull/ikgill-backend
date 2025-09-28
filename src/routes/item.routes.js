import express from "express";
import * as itemController from "../controllers/item.controller.js";
import { authCheck } from "../middlewares/auth.middleware.js";
import {  SingleuploadMiddleware, uploadMiddleware } from "../middlewares/awsUpload.middleware.js";
const ItemsRoutes = express.Router();


ItemsRoutes.post("/CreateItem",authCheck,SingleuploadMiddleware, itemController.createItem);
ItemsRoutes.get("/getItems",authCheck, itemController.getItems);
ItemsRoutes.get("/getItem/:id",authCheck, itemController.getItem);
ItemsRoutes.put("/updateItem/:id",authCheck,SingleuploadMiddleware, itemController.updateItem);
ItemsRoutes.delete("/deleteItem/:id",authCheck, itemController.deleteItem);
ItemsRoutes.get("/getAllBrands",authCheck, itemController.getBrandsByUserController);
export default ItemsRoutes; 
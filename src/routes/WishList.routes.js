import express from "express";
import { createWishlist, getWishlists, deleteWishlist, addImagesToWishlist } from "../controllers/WishList.controller.js";
import { authCheck } from "../middlewares/auth.middleware.js";
import { uploadMiddleware } from "../middlewares/awsUpload.middleware.js";

const WishListRoutes = express.Router();



WishListRoutes.post("/CreateWishList", authCheck, uploadMiddleware.array("images", 10), createWishlist);


WishListRoutes.get("/GetAllWishList", authCheck, getWishlists);

WishListRoutes.get("/GetWishListById/:id", authCheck, getWishlists);

WishListRoutes.post("/AddImagesToWishlist/:id", authCheck,uploadMiddleware.array("images", 10),addImagesToWishlist);


WishListRoutes.delete("/DeleteWishList/:id", authCheck, deleteWishlist);

export default WishListRoutes;

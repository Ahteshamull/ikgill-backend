import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../../controllers/product/product.js";

const router = express.Router();

// localhost:3000/api/v1/product/create-product
router.post("/create-product", createProduct);

// localhost:3000/api/v1/product/all-products
router.get("/all-products", getAllProducts);

// localhost:3000/api/v1/product/single-product/:id
router.get("/single-product/:id", getProductById);

// localhost:3000/api/v1/product/update-product/:id
router.patch("/update-product/:id", updateProduct);

// localhost:3000/api/v1/product/delete-product/:id
router.delete("/delete-product/:id", deleteProduct);

export default router;

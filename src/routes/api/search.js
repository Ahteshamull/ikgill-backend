import express from "express";
import {
  searchUser,
  searchProduct,
  searchCase,
  searchClinic,
  searchLab,
} from "../../controllers/search/search.js";

const router = express.Router();

// localhost:3000/api/v1/search/user?q=john
router.get("/user", searchUser);

// localhost:3000/api/v1/search/product?q=crown
router.get("/product", searchProduct);

// localhost:3000/api/v1/search/case?q=12345
router.get("/case", searchCase);

// localhost:3000/api/v1/search/clinic?q=dental
router.get("/clinic", searchClinic);

// localhost:3000/api/v1/search/lab?q=lab
router.get("/lab", searchLab);

export default router;

import express from "express";
import {
  createAboutUs,
  updateAboutUs,
  getAboutUs,
} from "../../../controllers/setting/aboutUs.js";
import { upload } from "../../../middlewares/imageControlMiddleware.js";
const router = express.Router();

////localhost:3000/api/v1/setting/create-about-us
router.post("/create-about-us", upload.any(), createAboutUs);

////localhost:3000/api/v1/setting/about-us/:id
router.get("/about-us", getAboutUs);

////localhost:3000/api/v1/setting/update-about-us/:id
router.put("/update-about-us/:id", upload.any(), updateAboutUs);

export default router;

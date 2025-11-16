import express from "express";
import {
  createAboutUs,
  getAboutUs,
} from "../../../controllers/setting/aboutUs.js";
import { upload } from "../../../middlewares/imageControlMiddleware.js";
const router = express.Router();

////localhost:3000/api/v1/setting/create-about-us
router.patch("/create-about-us", upload.any(), createAboutUs);

////localhost:3000/api/v1/setting/about-us
router.get("/about-us", getAboutUs);



export default router;

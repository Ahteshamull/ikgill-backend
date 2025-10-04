import express from "express";
import {
  createPrivacyPolicy,
  updatePrivacyPolicy,
  getSinglePrivacyPolicy,
} from "../../../controllers/setting/privacyPolicy.js";
import { upload } from "../../../middlewares/imageControlMiddleware.js";
const router = express.Router();

////localhost:3000/api/v1/setting/create-privacy-policy
router.post("/create-privacy-policy", upload.any(), createPrivacyPolicy);

////localhost:3000/api/v1/setting/privacy-policy
router.get("/privacy-policy/:id", getSinglePrivacyPolicy);

////localhost:3000/api/v1/setting/update-privacy-policy/:id
router.put("/update-privacy-policy/:id", upload.any(), updatePrivacyPolicy);

export default router;

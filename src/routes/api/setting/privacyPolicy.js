import express from "express";
import {
  createPrivacyPolicy,

  getPrivacyPolicy,
} from "../../../controllers/setting/privacyPolicy.js";
import { upload } from "../../../middlewares/imageControlMiddleware.js";
const router = express.Router();

////localhost:3000/api/v1/setting/create-privacy-policy
router.patch("/create-privacy-policy", upload.any(), createPrivacyPolicy);

////localhost:3000/api/v1/setting/privacy-policy
router.get("/privacy-policy", getPrivacyPolicy);



export default router;

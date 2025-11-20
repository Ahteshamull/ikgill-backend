import express from "express";
import {
  getAllAdmin,
  getSingleAdmin,
  updateAdmin,
  updateAdminImage,
} from "../../controllers/admin/createAdmin.js";
import { upload } from "../../middlewares/imageControlMiddleware.js";
const router = express.Router();

//localhost:3000/api/v1/admin/all-admin
router.get("/all-admin", getAllAdmin);

//localhost:3000/api/v1/admin/single-admin/:id
router.get("/single-admin/:id", getSingleAdmin);

//localhost:3000/api/v1/admin/update-admin/:id
router.patch("/update-admin/:id", updateAdmin);

//localhost:3000/api/v1/admin/update-admin-image/:id
router.patch(
  "/update-admin-image/:id",
  upload.single("image"),
  updateAdminImage
);

export default router;

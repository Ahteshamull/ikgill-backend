import express from "express";
import { createAdmin, deleteAdmin, getAllAdmin, getSingleAdmin } from "../../controllers/admin/createAdmin.js";
import { upload } from "../../middlewares/imageControlMiddleware.js";
import superAdminMiddleware from "../../middlewares/superAdminMiddleware.js";
const router = express.Router();

//localhost:3000/api/v1/admin/create-admin
router.post("/create-admin",superAdminMiddleware, upload.any(), createAdmin);

//localhost:3000/api/v1/admin/all-admin
router.get("/all-admin", getAllAdmin);

//localhost:3000/api/v1/admin/single-admin/:id
router.get("/single-admin/:id", getSingleAdmin);

//localhost:3000/api/v1/admin/delete-admin/:id
router.delete("/delete-admin/:id", superAdminMiddleware, deleteAdmin);

export default router;

import express from "express";
import {
  changeClinicStatus,
  createClinic,
  deleteClinic,
  getClinic,
  singleClinicById,
  updateClinic,
} from "../../controllers/clinic/clinic.js";
import superAdminMiddleware from "../../middlewares/superAdminMiddleware.js";
import userAuthMiddleware from "../../middlewares/userAuthMiddleware.js";

const router = express.Router();
//localhost:3000/api/v1/lab/create-lab
router.post("/create-clinic", superAdminMiddleware, createClinic);

router.get("/get-clinic", userAuthMiddleware, getClinic);

router.put("/update-clinic/:id", updateClinic);

router.get("/single-clinic/:id", singleClinicById);

router.delete("/delete-clinic/:id", deleteClinic);

router.patch("/change-clinic-status/:id", changeClinicStatus);

export default router;

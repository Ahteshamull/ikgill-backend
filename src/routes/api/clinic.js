import express from "express";
import {
  changeClinicStatus,
  createClinic,
  deleteClinic,
  getClinic,
  singleClinicById,
  updateClinic,
} from "../../controllers/clinic/clinic.js";

const router = express.Router();
//localhost:3000/api/v1/lab/create-lab
router.post("/create-clinic", createClinic);

router.get("/get-clinic", getClinic);

router.put("/update-clinic/:id", updateClinic);

router.get("/single-clinic/:id", singleClinicById);

router.delete("/delete-clinic/:id", deleteClinic);

router.patch("/change-clinic-status/:id", changeClinicStatus);

export default router;

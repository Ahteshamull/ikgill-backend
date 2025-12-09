import express from "express";
import {
  changeLabStatus,
  createLab,
  deleteLab,
  getLab,
  singleLabById,
  updateLab,
  getActiveLabs,
} from "../../controllers/lab/lab.js";

const router = express.Router();
//localhost:3000/api/v1/lab/create-lab
router.post("/create-lab", createLab);

router.get("/get-lab", getLab);

router.get("/active-labs", getActiveLabs);

router.put("/update-lab/:id", updateLab);

router.get("/single-lab/:id", singleLabById);

router.delete("/delete-lab/:id", deleteLab);

router.patch("/change-lab-status/:id", changeLabStatus);

export default router;

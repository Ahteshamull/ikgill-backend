import express from "express";
import { createLab, deleteLab, getLab, singleLabById, updateLab } from "../../controllers/lab/lab.js";


const router = express.Router();
//localhost:3000/api/v1/lab/create-lab
router.post("/create-lab", createLab);

router.get("/get-lab", getLab);

router.put("/update-lab/:id", updateLab);

router.get("/single-lab/:id", singleLabById);

router.delete("/delete-lab/:id", deleteLab);

export default router;
import express from "express";
import {
  createTrams,
  updateTrams,
  getSingleTrams,
} from "../../../controllers/setting/trams.js";
import { upload } from "../../../middlewares/imageControlMiddleware.js";
const router = express.Router();

////localhost:3000/api/v1/setting/create-trams
router.post("/create-trams", upload.any(), createTrams);

////localhost:3000/api/v1/setting/trams/:id
router.get("/trams/:id", getSingleTrams);

////localhost:3000/api/v1/setting/update-trams/:id
router.put("/update-trams/:id", upload.any(), updateTrams);

export default router;

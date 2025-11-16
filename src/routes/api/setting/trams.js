import express from "express";
import {
  createTrams,

  getTrams,
} from "../../../controllers/setting/trams.js";
import { upload } from "../../../middlewares/imageControlMiddleware.js";
const router = express.Router();

////localhost:3000/api/v1/setting/create-trams
router.patch("/create-trams", upload.any(), createTrams);

////localhost:3000/api/v1/setting/trams
router.get("/trams", getTrams);


export default router;

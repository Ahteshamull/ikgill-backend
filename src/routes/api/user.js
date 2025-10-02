import express from "express";
import { createUser } from "../../controllers/user/user.js";
import { upload } from "../../middlewares/imageControlMiddleware.js";

const router = express.Router();
//localhost:3000/api/v1/user/create-user
router.post("/create-user", upload.any(), createUser);

export default router;

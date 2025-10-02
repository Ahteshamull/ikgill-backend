import express from "express";
import auth from "./auth.js"; 
import user from "./user.js"; 
import lab from "./lab.js";
import clinic from "./clinic.js";
// import message from "./message.js";

const router = express.Router();

// localhost:3000/api/v1/auth/
router.use("/auth", auth);

// localhost:3000/api/v1/user/
router.use("/user", user);

// localhost:3000/api/v1/lab/
router.use("/lab", lab);

// localhost:3000/api/v1/clinic/
router.use("/clinic", clinic);

export default router;

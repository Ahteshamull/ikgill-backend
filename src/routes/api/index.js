import express from "express";
import auth from "./auth.js";
import user from "./user.js";
import lab from "./lab.js";
import clinic from "./clinic.js";
import admin from "./admin.js";
import privacyPolicy from "./setting/privacyPolicy.js";
import aboutUs from "./setting/aboutUs.js";
import trams from "./setting/trams.js";
import message from "./message.js";
import cases from "./cases.js";
import notification from "./notification.js";
import product from "./product.js";
import search from "./search.js";
const router = express.Router();

// localhost:3000/api/v1/auth/
router.use("/auth", auth);

// localhost:3000/api/v1/user/
router.use("/user", user);

// localhost:3000/api/v1/lab/
router.use("/lab", lab);

// localhost:3000/api/v1/clinic/
router.use("/clinic", clinic);

// localhost:3000/api/v1/admin/
router.use("/admin", admin);

// localhost:3000/api/v1/setting/
router.use("/setting", privacyPolicy);
router.use("/setting", aboutUs);
router.use("/setting", trams);

// localhost:3000/api/v1/message/
router.use("/message", message);

// localhost:3000/api/v1/case/
router.use("/case", cases);

// localhost:3000/api/v1/product/
router.use("/product", product);

// localhost:3000/api/v1/notification/
router.use("/notification", notification);

// localhost:3000/api/v1/search/
router.use("/search", search);

export default router;

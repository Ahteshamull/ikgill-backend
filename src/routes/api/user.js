import express from "express";
import {
  allBlockUserList,
  changeUserImage,
  changeUserStatus,
  createUser,
  deleteUser,
  getAllUser,
  getSingleUser,
  getUserCountByRole,
  getUserRatioByMonth,
  updateUser,
  userUpdatePersonalInfo,
  userLogin,
  userChangePassword,
  refreshAccessToken,
  createTechnationtoLabmanager,
} from "../../controllers/user/user.js";
import { upload } from "../../middlewares/imageControlMiddleware.js";
import userAuthMiddleware from "../../middlewares/userAuthMiddleware.js";
import labManagerAuth from "../../middlewares/labManager.js";
import superAdminMiddleware from "../../middlewares/superAdminMiddleware.js";

const router = express.Router();
//localhost:3000/api/v1/user/create-user
router.post("/create-user", upload.any(), superAdminMiddleware, createUser);

router.put("/update-user/:id", upload.any(), updateUser);

router.get("/get-all-user", getAllUser);

router.get("/get-user/:id", getSingleUser);

router.delete("/delete-user/:id", superAdminMiddleware, deleteUser);

router.patch("/change-user-status/:id", changeUserStatus);

router.patch("/change-user-image/:id", upload.any(), changeUserImage);

router.get("/all-block-user-list", allBlockUserList);

router.get("/user-count-by-role", getUserCountByRole);

router.get("/user-ratio-by-month", getUserRatioByMonth);

router.patch(
  "/user-update-personal-info",
  userAuthMiddleware,
  userUpdatePersonalInfo
);

router.post("/user-login", userLogin);

router.post("/refresh-token", refreshAccessToken);

router.patch("/user-change-password", userAuthMiddleware, userChangePassword);

router.post(
  "/labManager-create-labTechnician",
  labManagerAuth,
  upload.any(),
  createTechnationtoLabmanager
);

export default router;

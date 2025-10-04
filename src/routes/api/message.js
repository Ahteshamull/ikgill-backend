import express from "express";
import { getMessages, getUsersForSidebar, sendMessage } from "../../controllers/message/message.js";
import { upload } from "../../middlewares/imageControlMiddleware.js";
import userAuthMiddleware from "../../middlewares/userAuthMiddleware.js";

//localhost:3000/api/v1/message/send-message
const router = express.Router();
router.get("/users", userAuthMiddleware, getUsersForSidebar);
router.get("/:id", userAuthMiddleware, getMessages);
router.post("/send-message/:id", userAuthMiddleware, upload.any(), sendMessage);

export default router;

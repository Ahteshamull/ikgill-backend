import express from "express";
import { AllDeleteAccountListController, deleteAccountController, requestForAccountDelete } from "../controllers/DeleteAccount.controller.js";
import { authCheck} from "../middlewares/auth.middleware.js";
import { authChecks } from "../middlewares/authForAdmin.middleware.js";

const DeleteAccount = express.Router();

DeleteAccount.delete("/delete/:id", authChecks, deleteAccountController);
DeleteAccount.post("/deleteRequest", authCheck, requestForAccountDelete);
DeleteAccount.get("/AllAccount", authChecks, AllDeleteAccountListController);


export default DeleteAccount;

import express  from "express";
import { authCheck } from "../middlewares/auth.middleware.js";
import * as Comunity from "../controllers/Community.controller.js"
const CommunityRoutes= express.Router()


CommunityRoutes.get("/getAllPost",authCheck,Comunity.getAllPostsController);
CommunityRoutes.post("/ReportToPost",authCheck,Comunity.reportPostController);
CommunityRoutes.post("/ReactToPost",authCheck,Comunity.reactPostController);



export default CommunityRoutes
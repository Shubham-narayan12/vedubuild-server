import express from "express";
import { bannerUploadMiddleware, getAllBannerController, uploadBannerController } from "../controllers/uploadController.js";

const router = express.Router();

//FILE UPLOAD ROUTER
router.post("/upload",bannerUploadMiddleware,uploadBannerController);

//GET ALL BANNERS
router.get("/get-all-banner",getAllBannerController)




export default router;
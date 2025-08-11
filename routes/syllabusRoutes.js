import express from "express"
import { isAuth } from "../middlewares/authMiddleware.js";
import multer from "multer";
import { syllabusDownloadController, syllabusUploadController } from "../controllers/syllabusController.js";



//router object
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });



//UPLOAD SYLLABUS
router.post("/upload",upload.single("file"),syllabusUploadController)

//DOWNLOAD SYLLABUS
router.get("/download",syllabusDownloadController)



export default router;
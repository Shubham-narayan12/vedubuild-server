import express from "express"
import { applyController, bulkApplyController, downloadExcelController } from "../controllers/studentControllers.js";
import { isAuth } from "../middlewares/authMiddleware.js";
import multer from "multer";



//router object
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({storage: storage})  ;


//APPLY ROUTES
router.post("/apply",applyController)

//BULK APPLY 
router.post("/bulk-apply", upload.single("file"),bulkApplyController)

//DOWNLOAD STUDENTS DATA IN EXCEL
router.get("/downalod-data",isAuth,downloadExcelController)

export default router;
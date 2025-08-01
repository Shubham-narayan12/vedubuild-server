import express from "express"
import { applyController, bulkApplyController, downloadExcelController } from "../controllers/studentControllers.js";
import { isAuth } from "../middlewares/authMiddleware.js";



//router object
const router = express.Router();


//APPLY ROUTES
router.post("/apply",applyController)

//BULK APPLY 
router.post("/bulk-apply",isAuth,bulkApplyController)

//DOWNLOAD STUDENTS DATA IN EXCEL
router.get("/downalod-data",isAuth,downloadExcelController)

export default router;
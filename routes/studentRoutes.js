import express from "express"
import { applyController, bulkApplyController, downloadCertificateController, downloadExcelController, requestOtpController, resetPasswordWithOtpController, studentLoginController, studentLogoutController } from "../controllers/studentControllers.js";
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

//STUDENT LOGIN
router.post("/login",studentLoginController)    //password = 0HnauiOZ

//STUDENT LOGOUT 
router.get("/logout", studentLogoutController)

//STUDENT REQUEST FOR OTP FOR PASSWORD RESET
router.post("/request-otp", requestOtpController)

//STUDENT RESET PASSWORD WITH OTP
router.post("/reset-password",resetPasswordWithOtpController)

//DOWNLOAD CERTIFICATE
router.get("/download-certificate",downloadCertificateController)

export default router;
import express from "express";
import {
  applyController,
  bulkApplyController,
  deleteStudentController,
  downloadCertificateController,
  downloadExcelController,
  getAllStudentData,
  getStudentImage,
  
  requestOtpController,
  resetPasswordWithOtpController,
  sendStudentCredentials,
  studentLoginController,
  studentLogoutController,
  totalNumberOfstudent,
  updatePaymentStatusController,
  uploadStudentImage,
} from "../controllers/studentControllers.js";
import { isAuth } from "../middlewares/authMiddleware.js";
import multer from "multer";

//router object
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//APPLY ROUTES
router.post("/apply", applyController);

//SEND CREDENTIAL TO APPLIED STUDENT THROUGH EMAIL
router.post("/:studentId/send-credentials",sendStudentCredentials)

//UPDATE STUDENT PAYMENT STATUS
router.post("/update-payment-status/:id",updatePaymentStatusController)

//GET ALL STUDENTS DATA
router.get("/get-allstudents-data", getAllStudentData);

//UPLOAD PROFILE PIC
router.post(
  "/upload-profile-pic",
  upload.single("profileImage"),
  uploadStudentImage
);

//SHOW PROFILE PIC
router.get("/image/:emailId", getStudentImage);

//BULK APPLY
router.post("/bulk-apply", upload.single("file"), bulkApplyController);

//DOWNLOAD STUDENTS DATA IN EXCEL
router.get("/download-data", downloadExcelController);

//STUDENT LOGIN
router.post("/login", studentLoginController);

//STUDENT LOGOUT
router.get("/logout", studentLogoutController);

//STUDENT REQUEST FOR OTP FOR PASSWORD RESET
router.post("/request-otp", requestOtpController);

//STUDENT RESET PASSWORD WITH OTP
router.post("/reset-password", resetPasswordWithOtpController);

//DOWNLOAD CERTIFICATE
router.get("/download-certificate", downloadCertificateController);

//TOTAL NUMBER OF STUDENTS
router.get("/total-students", totalNumberOfstudent);

//DELETE STUDENT BY ID
router.delete("/:id",deleteStudentController)

export default router;

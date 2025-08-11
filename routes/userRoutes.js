import express from "express";
import {
  createUserController,
  requestOtpController,
  resetPasswordWithOtpController,
  toggleCertificateController,
  userLoginController,
  userLogoutController,
} from "../controllers/userController.js";

//router object
const router = express.Router();

//==============Routers Objects ============

//REGISTER USER
router.post("/create-user", createUserController);

//USER LOGIN
router.post("/login", userLoginController);

//USER LOGOUT
router.get("/logout", userLogoutController);

//REQUEST OTP FOR PASSWORD RESET
router.post("/request-otp", requestOtpController);

//RESET PASSWORD WITH OTP
router.post("/reset-password", resetPasswordWithOtpController);

//TOGGLE FOR CERTIFICATE
router.put("/toggle-certificate", toggleCertificateController);

export default router;

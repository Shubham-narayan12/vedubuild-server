import express from "express";
import {
  requestEmailOtp,
  requestPhoneOtp,
  verifyEmailController,
  verifyPhoneController,
} from "../controllers/otpController.js";

//routes objects
const router = express.Router();

//==============OTP ROUTES===============

//REQUEST EMAIL OTP
router.post("/request-email-otp", requestEmailOtp);

//REQUEST PHONE OTP
router.post("/request-phone-otp", requestPhoneOtp);

//VERIFY EMAIL
router.post("/verify-email-otp", verifyEmailController);

//VERIFY PHONE
router.post("/verify-phone-otp", verifyPhoneController);

export default router;

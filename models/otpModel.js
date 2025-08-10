import mongoose from "mongoose";

const emailOtpVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, sparse: true },
  
  emailOtp: { type: String, default: "" },
  
  emailVerified: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now, expires: 600 }, // 10 min expiry
});

const phoneOtpVerificationSchema = new mongoose.Schema({
   phone: { type: String, required: true, unique: true, sparse: true },
   phoneOtp: { type: String, default: "" },
   phoneVerified: { type: Boolean, default: false },
   createdAt: { type: Date, default: Date.now, expires: 600 }, // 10 min expiry
});

export const emailOtpVerification = mongoose.model('EmailOtpVerifications', emailOtpVerificationSchema);


export const phoneOtpVerification = mongoose.model('PhoneOtpVerifications',phoneOtpVerificationSchema);

import {
  emailOtpVerification,
  phoneOtpVerification,
} from "../models/otpModel.js";
import studentModel from "../models/studentModel.js";

import { sendEmail } from "../utils/sendemail.js";
import { sendSms } from "../utils/sendsms.js";

// Generate OTP helper
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

//GENERATE EMAIL OTP AND SEND
export const requestEmailOtp = async (req, res) => {
  try {
    const { emailId } = req.body;
    if (!emailId) {
      return res
        .status(400)
        .json({ success: false, message: "Email required" });
    }
    //Checking Existing emailIdid
    const existingemailId = await studentModel.findOne({ emailId });
    if (existingemailId) {
      return res.status(409).send({
        success: false,
        message: "emailId already Exist",
      });
    }

    const emailOtp = generateOTP();

    // Upsert OTP entry
    let otpEntry = await emailOtpVerification.findOne({ emailId }); ////email otp
    if (otpEntry) {
      otpEntry.emailOtp = emailOtp;
      otpEntry.emailVerified = false;
      otpEntry.createdAt = new Date();
      await otpEntry.save();
    } else {
      otpEntry = new emailOtpVerification({
        //email otp

        emailId,

        emailOtp,

        emailVerified: false,
      });
      await otpEntry.save();
    }

    await sendEmail(emailId, "Verify Email OTP", "otpEmail", {
      otp: emailOtp,
      expiry: 5,
    });

    res.json({ success: true, message: "Email OTP sent" });
  } catch (error) {
    console.error("Error requesting email OTP:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//REQUEST FOR PHONE OTP AND SEND

export const requestPhoneOtp = async (req, res) => {
  try {
    const { mobileNo } = req.body;
    if (!mobileNo) {
      return res
        .status(400)
        .json({ success: false, message: "Phone required" });
    }
    //Checking Existing mobileNo
        const existingemobileNo= await studentModel.findOne({ mobileNo });
        if (existingemobileNo) {
          return res.status(500).send({
            success: false,
            message: "mobileNo already Exist",
          });
        }

    const phoneOtp = generateOTP();

    let otpEntry = await phoneOtpVerification.findOne({ mobileNo }); ///phone otp
    if (otpEntry) {
      otpEntry.phoneOtp = phoneOtp;
      otpEntry.phoneVerified = false;
      otpEntry.createdAt = new Date();
      await otpEntry.save();
    } else {
      otpEntry = new phoneOtpVerification({
        //phone otp
        mobileNo,

        phoneOtp,

        phoneVerified: false,
      });
      await otpEntry.save();
    }

    await sendSms(mobileNo, phoneOtp);

    res.json({
      success: true,
      message: `OTP sent successfully to ${mobileNo}`,
    });
  } catch (error) {
    console.error("Error requesting phone OTP:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

///OtpVerification jaha milega change krdo

//VERIFY EMAIL OTP
export const verifyEmailController = async (req, res) => {
  try {
    const { emailId, otp } = req.body;
    if (!emailId || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP required" });

    const otpEntry = await emailOtpVerification.findOne({ emailId });
    if (!otpEntry)
      return res.status(404).json({
        success: false,
        message: "No OTP request found for this email",
      });

    if (otpEntry.emailVerified)
      return res.json({ success: true, message: "Email already verified" });

    if (otpEntry.emailOtp === otp) {
      otpEntry.emailVerified = true;
      await otpEntry.save();
      return res.json({
        success: true,
        message: "Email verified successfully",
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email OTP" });
    }
  } catch (error) {
    console.error("Error verifying email OTP:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//VERIFY PHONE OTP
export const verifyPhoneController = async (req, res) => {
  const { mobileNo, otp } = req.body;
  if (!mobileNo || !otp)
    return res
      .status(400)
      .json({ success: false, message: "Phone and OTP required" });

  const otpEntry = await phoneOtpVerification.findOne({ mobileNo });
  if (!otpEntry)
    return res
      .status(404)
      .json({ success: false, message: "No OTP request found for this phone" });

  if (otpEntry.phoneVerified)
    return res.json({ success: true, message: "Phone already verified" });

  if (otpEntry.phoneOtp === otp) {
    otpEntry.phoneVerified = true;
    await otpEntry.save();
    return res.json({ success: true, message: "Phone verified successfully" });
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Phone OTP" });
  }
};

import {
  emailOtpVerification,
  phoneOtpVerification,
} from "../models/otpModel.js";

// Generate OTP helper
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

//GENERATE EMAIL OTP AND SEND
export const requestEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email required" });

    const emailOtp = generateOTP();

    // Upsert OTP entry
    let otpEntry = await emailOtpVerification.findOne({ email }); ////email otp
    if (otpEntry) {
      otpEntry.emailOtp = emailOtp;
      otpEntry.emailVerified = false;
      otpEntry.createdAt = new Date();
      await otpEntry.save();
    } else {
      otpEntry = new emailOtpVerification({
        //email otp

        email,

        emailOtp,

        emailVerified: false,
      });
      await otpEntry.save();
    }

    // TODO: Send OTP by email using nodemailer
    console.log(`Email OTP for ${email}: ${emailOtp}`);

    res.json({ success: true, message: "Email OTP sent" });
  } catch (error) {
    console.error("Error requesting email OTP:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//REQUEST FOR PHONE OTP AND SEND

export const requestPhoneOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone)
      return res
        .status(400)
        .json({ success: false, message: "Phone required" });

    const phoneOtp = generateOTP();

    let otpEntry = await phoneOtpVerification.findOne({ phone }); ///phone otp
    if (otpEntry) {
      otpEntry.phoneOtp = phoneOtp;
      otpEntry.phoneVerified = false;
      otpEntry.createdAt = new Date();
      await otpEntry.save();
    } else {
      otpEntry = new phoneOtpVerification({
        //phone otp
        phone,

        phoneOtp,

        phoneVerified: false,
      });
      await otpEntry.save();
    }

    // TODO: Send OTP by SMS using Twilio
    console.log(`Phone OTP for ${phone}: ${phoneOtp}`);

    res.json({
      success: true,
      message: `Phone OTP sent and Phone OTP for ${phone}: ${phoneOtp}`,
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
    const { email, otp } = req.body;
    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP required" });

    const otpEntry = await emailOtpVerification.findOne({ email });
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
  const { phone, otp } = req.body;
  if (!phone || !otp)
    return res
      .status(400)
      .json({ success: false, message: "Phone and OTP required" });

  const otpEntry = await phoneOtpVerification.findOne({ phone });
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

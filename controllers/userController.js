import userModel from "../models/userModel.js";
import studentModel from "../models/studentModel.js";

//CREATE USER
export const createUserController = async (req, res) => {
  try {
    const { name, email, password, city, state, phone } = req.body;

    //EXISTINGUSER
    const existingUser = await userModel.findOne({ email });
    //validation
    if (existingUser) {
      return res.status(500).send({
        success: false,
        message: "email already Exist",
      });
    }
    const user = await userModel.create({
      name,
      email,
      password,
      city,
      state,
      phone,
    });
    res.status(201).send({
      success: true,
      message: "Register Successfull",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In register API",
    });
  }
};

//LOGIN USER
export const userLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "please provide username and password",
      });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User Not found",
      });
    }
    //CHECK PASSWORD
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid password",
      });
    }
    //token
    const token = user.generateToken();

    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: true, // only send over HTTPS
        sameSite: "None", // important for cross-origin (frontend/backend different domain)
        expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      })
      .send({
        success: true,
        message: "LOGIN SUCCESSFUL",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In LOGIN API",
    });
  }
};

//LOGOUT USER
export const userLogoutController = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
      })
      .send({
        success: true,
        message: "Logout Successfully",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In LOgout API",
      error,
    });
  }
};

//REQUEST OTP FOR PASSWORD RESET
export const requestOtpController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .send({ success: false, message: "Email is required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 2 * 60 * 1000; // 2 min
    await user.save();
    console.log(`OTP FOR PASSWORD ${email} = ${otp} `),
      res.status(200).send({
        success: true,
        message: "OTP sent to email",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error sending OTP" });
  }
};

//RESET PASSWORD WITH OTP
export const resetPasswordWithOtpController = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .send({ success: false, message: "All fields are required" });
    }
    const user = await userModel.findOne({
      email,
      otp,
      otpExpire: { $gt: Date.now() }, // OTP not expired
    });
    if (!user) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid or expired OTP" });
    }
    user.password = newPassword; // pre-save hook will hash it
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).send({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, message: "Error resetting password" });
  }
};

//TOGGLE CERTIFICATE
export const toggleCertificateController = async (req, res) => {
  try {
    const { status } = req.body; // status = true/false

    const result = await studentModel.updateMany(
      {},
      { canDownloadCertificate: status }
    );

    res.status(200).send({
      success: true,
      message: `Certificate download access ${
        status ? "enabled" : "disabled"
      } for all students.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in toggle certificate download API",
    });
  }
};

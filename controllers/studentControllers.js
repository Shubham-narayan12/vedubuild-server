import { application } from "express";
import studentModel from "../models/studentModel.js";
import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendemail.js";

// SET PATH
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//APPLY NOW
export const applyController = async (req, res) => {
  try {
    //GENERATE RANDOM ID
    const generateAppID = (scholarship) => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let randomPart = "";
      for (let i = 0; i < 6; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const cleanScholarship = scholarship
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
      return `VEDU/${cleanScholarship}/${randomPart}`;
    };
    //GENERATE RANDOM PASSWORD
    const generatePassword = () => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let id = "";
      for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return id;
    };

    const {
      studentName,
      mobileNo,
      emailId,
      address,
      city,
      district,
      pinCode,
      schoolCollege,
      aadharNo,
      scholarship,
      studentClass,
      combination,
    } = req.body;

    const password = generatePassword();
    const aplication_id = generateAppID(scholarship);

    //validation
    if (
      !aplication_id ||
      !studentName ||
      !mobileNo ||
      !emailId ||
      !password ||
      !address ||
      !city ||
      !district ||
      !pinCode ||
      !schoolCollege ||
      !aadharNo ||
      !scholarship ||
      !studentClass
    ) {
      return res.status(500).send({
        success: false,
        message: "please provide all details",
      });
    }
    //Checking Existing emailIdid
    const existingemailId = await studentModel.findOne({ emailId });
    if (existingemailId) {
      return res.status(500).send({
        success: false,
        message: "emailId already Exist",
      });
    }

    //Checking Existing mobileNo
    const existingemobileNo = await studentModel.findOne({ mobileNo });
    if (existingemobileNo) {
      return res.status(500).send({
        success: false,
        message: "mobileNo already Exist",
      });
    }

    // Read default certificate PDF
    const certificatePath = path.join(
      process.cwd(),
      "public",
      "default-certificate.pdf"
    );
    const certificateBuffer = fs.readFileSync(certificatePath);

    //save krne se phele password bhejna hain through EMAIL
    await sendEmail(
      emailId, // recipient
      "Your Vedubuild Application Details", // subject
      "studentDetails", // template file (studentDetails.hbs)
      {
        name: studentName,
        applicationId: aplication_id,
        email: emailId,
        password: password,
      }
    );

    const student = await studentModel.create({
      aplication_id,
      studentName,
      mobileNo,
      emailId,
      password,
      address,
      city,
      district,
      pinCode,
      schoolCollege,
      aadharNo,
      scholarship,
      studentClass,
      combination,
      certificate: {
        file: certificateBuffer,
        contentType: "application/pdf",
        filename: "certificate.pdf",
      },
      canDownloadCertificate: false,
    });

    res.status(201).send({
      success: true,
      message: "apply successfull",
      student,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in apply API",
    });
  }
};

//GET ALL STUDENTS DATA
export const getAllStudentData = async (req, res) => {
  try {
    const students = await studentModel.find({});
    res.status(200).send({
      success: true,
      message: "Fetched all students data.",
      students,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in GET STUDENTS API",
    });
  }
};

// BULK APPLY
export const bulkApplyController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.worksheets[0];
    const rows = [];
    const headerRow = worksheet.getRow(1);

    // ✅ Header cleanup (trim + lowercase + underscores)
    const headers = headerRow.values.slice(1).map((h) =>
      (h || "")
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
    );

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      const rowVals = row.values.slice(1);
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = rowVals[idx] !== undefined ? rowVals[idx] : null;
      });
      rows.push(obj);
    });

    // GENERATE RANDOM ID
    const generateAppID = (scholarship) => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let randomPart = "";
      for (let i = 0; i < 6; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const cleanScholarship = (scholarship || "GENERIC")
        .toString()
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();

      return `VEDU/${cleanScholarship}/${randomPart}`;
    };

    // ✅ Transform Data (ab headers ke normalized keys use karenge)
    let studentsData = await Promise.all(
      rows.map(async (r) => {
        const scholarship = r.scholarship ?? r.course ?? "";

        const rawPassword = r.mobileno
          ? String(r.mobileno)
          : r.mobile
          ? String(r.mobile)
          : "123456";

        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        return {
          aplication_id: generateAppID(scholarship),
          studentName: r.studentname ?? r.name ?? "",
          mobileNo: r.mobileno ? Number(r.mobileno) : null,
          emailId: r.emailid ?? "",
          password: hashedPassword,
          address: r.address ?? r.residence ?? "",
          city: r.city ?? "",
          district: r.district ?? "",
          pinCode: r.pincode ? Number(r.pincode) : null,
          schoolCollege: r.schoolcollege ?? r.college ?? "",
          aadharNo: r.aadharno ? String(r.aadharno) : null,
          scholarship,
          studentClass: r.studentclass ?? r.standard ?? "",
          combination: r.combination ?? "",
        };
      })
    );

    // ✅ Filter required fields
    studentsData = studentsData.filter(
      (s) =>
        s.aplication_id &&
        s.studentName &&
        s.mobileNo &&
        s.emailId &&
        s.password &&
        s.address &&
        s.city &&
        s.district &&
        s.pinCode &&
        s.schoolCollege &&
        s.aadharNo &&
        s.scholarship
    );

    // ✅ Insert into DB
    let result;
    try {
      result = await studentModel.insertMany(studentsData, {
        ordered: false,
      });
    } catch (error) {
      if (error && error.writeErrors) {
        const inserted = error.result?.nInserted ?? 0;
        return res.status(200).json({
          message: "Upload done with some duplicates/errors skipped",
          totalRows: rows.length,
          insertedCount: inserted,
          skippedCount: studentsData.length - inserted,
        });
      }
      throw error;
    }

    return res.status(200).json({
      message: "Upload processed successfully",
      totalRows: rows.length,
      insertedCount: result.length,
      skippedCount: studentsData.length - result.length,
    });
  } catch (error) {
    console.error("UploadStudentsExcel error:", error);
    return res.status(500).json({
      message: "Server error processing file",
      error: error.message || error,
    });
  }
};

//DOWNLOAD-EXCEL
export const downloadExcelController = async (req, res) => {
  try {
    const students = await studentModel.find(
      {},
      {
        aplication_id: 1,
        studentName: 1,
        mobileNo: 1,
        emailId: 1,
        address: 1,
        city: 1,
        district: 1,
        pinCode: 1,
        schoolCollege: 1,
        aadharNo: 1,
        scholarship: 1,
        studentClass: 1,
        combination: 1,
        _id: 0,
      }
    );
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");

    //add columns in excel file
    worksheet.columns = [
      { header: "Application ID", key: "aplication_id", width: 20 },
      { header: "studentName", key: "studentName", width: 20 },
      { header: "mobileNo", key: "mobileNo", width: 15 },
      { header: "emailId", key: "emailId", width: 25 },
      { header: "address", key: "address", width: 30 },
      { header: "city", key: "city", width: 15 },
      { header: "district", key: "district", width: 15 },
      { header: "pinCode", key: "pinCode", width: 10 },
      { header: "schoolCollege", key: "schoolCollege", width: 25 },
      { header: "aadharNo", key: "aadharNo", width: 20 },
      { header: "scholarship", key: "scholarship", width: 15 },
      { header: "studentClass", key: "studentClass", width: 15 },
      { header: "combination", key: "combination", width: 15 },
    ];

    // Add rows
    students.forEach((student) => {
      worksheet.addRow(student);
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");

    // Write workbook to response stream
    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in GENERATE EXCEL API",
    });
  }
};

//STUDENT LOGIN
export const studentLoginController = async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId || !password) {
      return res.status(500).send({
        success: false,
        message: "please provide username and password",
      });
    }
    const user = await studentModel.findOne({ emailId });
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
        token,
        student: {
          emailId: user.emailId, // 👈 frontend ko email bhi bhej
        },
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In LOGIN API",
    });
  }
};

//STUDENT LOGOUT
export const studentLogoutController = async (req, res) => {
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

//STUDENT REQUEST FOR OTP FOR PASSWORD RESET
export const requestOtpController = async (req, res) => {
  try {
    const { emailId } = req.body;
    if (!emailId) {
      return res
        .status(400)
        .send({ success: false, message: "emailId is required" });
    }

    const user = await studentModel.findOne({ emailId });
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
    console.log(`OTP FOR PASSWORD ${emailId} = ${otp} `),
      await sendEmail(
        emailId, // recipient
        "Your OTP for Reset Password", // subject
        "resetPassword", // template file (resetPassword.hbs)
        {
          name: user.studentName,
          email: emailId,
          otp: otp,
          expiry: 2,
        }
      );
    res.status(200).send({
      success: true,
      message: "OTP sent to emailId",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error sending OTP" });
  }
};

// STUDENT RESET PASSWORD WITH OTP
export const resetPasswordWithOtpController = async (req, res) => {
  try {
    const { emailId, otp, newPassword } = req.body;
    if (!emailId || !otp || !newPassword) {
      return res
        .status(400)
        .send({ success: false, message: "All fields are required" });
    }
    const user = await studentModel.findOne({
      emailId,
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

//DOWNLOAD CERTIFICATE
export const downloadCertificateController = async (req, res) => {
  try {
    const { emailId } = req.query;

    const student = await studentModel.findOne({ emailId });
    if (!student) {
      return res.status(404).send({ message: "Student not found" });
    }
    if (!student.canDownloadCertificate) {
      return res
        .status(403)
        .send({ message: "Certificate download not allowed yet" });
    }
    if (!student.certificate || !student.certificate.file) {
      return res.status(404).send({ message: "Certificate file not found" });
    }
    res.set({
      "Content-Type": student.certificate.contentType,
      "Content-Disposition": `attachment; filename="${student.certificate.filename}"`,
    });
    res.send(student.certificate.file);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in certificate download API",
    });
  }
};

//GET LOGGED-IN STUDENT PROFILE
export const getStudentProfileController = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(404)
        .send({ success: false, message: "Student not found" });
    }

    const student = await studentModel
      .findById(req.user._id)
      .select("-password -otp -otpExpire");

    res.status(200).send({
      success: true,
      student,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error fetching profile" });
  }
};

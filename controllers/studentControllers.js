import { application } from "express";
import studentModel from "../models/studentModel.js";
import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// SET PATH
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//APPLY NOW
export const applyController = async (req, res) => {
  try {
    //GENERATE RANDOM ID
    const generateAppID = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let id = "";
      for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return id;
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
      name,
      number,
      email,
      addresh,
      city,
      state,
      pincode,
      college_name,
      aadhar_number,
      program,
      classStd,
    } = req.body;

    let { password } = req.body;

    password = generatePassword();
    const aplication_id = generateAppID();

    //validation
    if (
      !aplication_id ||
      !name ||
      !number ||
      !email ||
      !password ||
      !addresh ||
      !city ||
      !state ||
      !pincode ||
      !college_name ||
      !aadhar_number ||
      !program ||
      !classStd
    ) {
      return res.status(500).send({
        success: false,
        message: "please provide all details",
      });
    }
    //Checking Existing Emailid
    const existingEmail = await studentModel.findOne({ email });
    if (existingEmail) {
      return res.status(500).send({
        success: false,
        message: "email already Exist",
      });
    }
    // Read default certificate PDF
    const certificatePath = path.join(
      process.cwd(),
      "public",
      "default-certificate.pdf"
    );
    const certificateBuffer = fs.readFileSync(certificatePath);

    //save krne se phele password bhejna hain
    console.log(`your email:${email} and password:${password}`);

    const student = await studentModel.create({
      aplication_id,
      name,
      number,
      email,
      password,
      addresh,
      city,
      state,
      pincode,
      college_name,
      aadhar_number,
      program,
      classStd,
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

//BULK APPLY
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
    const headers = headerRow.values
      .slice(1)
      .map((h) => (h || "").toString().trim());

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      const rowVals = row.values.slice(1);
      const obj = {};
      headers.forEach((h, idx) => {
        const key = h
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "");
        obj[key] = rowVals[idx] !== undefined ? rowVals[idx] : null;
      });
      rows.push(obj);
    });

    const generateAppID = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let id = "";
      for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return id;
    };

    const studentsData = rows.map((r) => ({
      aplication_id: generateAppID(),
      name: r.name ?? "",
      number: r.number ? Number(r.number) : r.mobile ? Number(r.mobile) : null,
      email: r.email ?? "",
      addresh: r.addresh ?? r.address ?? r.residence ?? "",
      city: r.city ?? "",
      state: r.state ?? "",
      pincode: r.pincode ? Number(r.pincode) : null,
      college_name: r.college_name ?? r.college ?? "",
      aadhar_number: r.aadhar_number
        ? Number(r.aadhar_number)
        : r.aadhar
        ? Number(r.aadhar)
        : null,
      program: r.program ?? r.course ?? "",
      classStd: r.classstd ?? r.class ?? r.standard ?? "",
    }));

    const filtered = studentsData.filter(
      (s) => s.aplication_id && s.name && s.number && s.email
    );
    const result = await studentModel.insertMany(filtered, { ordered: false });

    return res.status(200).json({
      message: "Upload processed",
      totalRows: rows.length,
      insertedCount: result.length,
      skippedCount: filtered.length - result.length,
    });
  } catch (error) {
    if (error && error.writeErrors) {
      const inserted = error.result?.nInserted ?? 0;
      return res.status(200).json({
        message: "Upload done with some duplicates/errors skipped",
        insertedCount: inserted,
        skippedCount: filtered
          ? filtered.length - inserted
          : error.writeErrors.length,
        error: "Some rows skipped (duplicates or validation errors)",
      });
    }

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
        name: 1,
        number: 1,
        email: 1,
        addresh: 1,
        city: 1,
        state: 1,
        pincode: 1,
        college_name: 1,
        aadhar_number: 1,
        program: 1,
        classStd: 1,
        _id: 0,
      }
    );
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");

    //add columns in excel file
    worksheet.columns = [
      { header: "Application ID", key: "aplication_id", width: 20 },
      { header: "Name", key: "name", width: 20 },
      { header: "Mobile Number", key: "number", width: 15 },
      { header: "Email", key: "email", width: 25 },
      { header: "Address", key: "addresh", width: 30 },
      { header: "City", key: "city", width: 15 },
      { header: "State", key: "state", width: 15 },
      { header: "Pincode", key: "pincode", width: 10 },
      { header: "College Name", key: "college_name", width: 25 },
      { header: "Aadhar Number", key: "aadhar_number", width: 20 },
      { header: "Program", key: "program", width: 15 },
      { header: "Class", key: "classStd", width: 15 },
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
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "please provide username and password",
      });
    }
    const user = await studentModel.findOne({ email });
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
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .send({ success: false, message: "Email is required" });
    }

    const user = await studentModel.findOne({ email });
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

// STUDENT RESET PASSWORD WITH OTP
export const resetPasswordWithOtpController = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .send({ success: false, message: "All fields are required" });
    }
    const user = await studentModel.findOne({
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

//DOWNLOAD CERTIFICATE
export const downloadCertificateController = async (req, res) => {
  try {
    const { email } = req.query;

    const student = await studentModel.findOne({ email });
    if (!student) {
      return res.status(404).send({ message: "Student not found" });
    }
    if (!student.canDownloadCertificate) {
      return res.status(403).send({ message: "Certificate download not allowed yet" });
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

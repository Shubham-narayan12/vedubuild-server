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

// APPLY NOW
export const applyController = async (req, res) => {
  try {
    // GENERATE RANDOM ID
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

    const {
      studentName,
      fatherName,
      mobileNo,
      emailId,
      address,
      city,
      district,
      pinCode,
      schoolCollege,
      boardName,
      aadharNo,
      scholarship,
      studentClass,
      combination,
    } = req.body;

    const aplication_id = generateAppID(scholarship);

    // VALIDATION
    if (
      !aplication_id ||
      !studentName ||
      !fatherName ||
      !mobileNo ||
      !emailId ||
      !address ||
      !city ||
      !district ||
      !pinCode ||
      !schoolCollege ||
      !boardName ||
      !aadharNo ||
      !scholarship ||
      !studentClass
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all details",
      });
    }

    // CHECK EXISTING EMAIL OR MOBILE
    /*const existingStudent = await studentModel.findOne({
      $or: [{ emailId }, { mobileNo }],
    });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student with same mobile or email already exists",
      });
    } */

    // CREATE STUDENT
    const student = await studentModel.create({
      aplication_id,
      studentName,
      fatherName,
      mobileNo,
      emailId,
      address,
      city,
      district,
      pinCode,
      schoolCollege,
      boardName,
      aadharNo,
      scholarship,
      studentClass,
      combination,
      canDownloadCertificate: false,
    });

    res.status(201).json({
      success: true,
      message: "Application successful",
      student,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in apply API",
    });
  }
};

//SEND STUDENT CREDENTIALS
export const sendStudentCredentials = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId required",
      });
    }

    const student = await studentModel.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    if (!student.emailId) {
      return res
        .status(400)
        .json({ success: false, message: "Student email not available" });
    }

    // ✅ Already sent check
    if (student.credentialsSentAt) {
      return res.status(400).json({
        success: false,
        message: "Credentials already sent earlier",
      });
    }

    // 🔑 Generate new password
    const generatePassword = () => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let id = "";
      for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return id;
    };

    const password = generatePassword();

    student.password = password;
    student.credentialsSentAt = new Date(); // ✅ Save timestamp
    await student.save();

    // 📧 Send email
    await sendEmail(
      student.emailId,
      "Your Vedubuild Application Details",
      "studentDetails",
      {
        name: student.studentName,
        applicationId: student.aplication_id,
        email: student.emailId,
        password,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Credentials generated, saved & email sent successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in Send Credentials API",
    });
  }
};

//UPLOAD STUDENT PROFILE PIC
export const uploadStudentImage = async (req, res) => {
  try {
    const { emailId } = req.body; // token se student ka id mil jayega
    const student = await studentModel.findOne({ emailId });

    if (!student) {
      return res
        .status(404)
        .send({ success: false, message: "Student not found" });
    }

    // file save
    student.profileImage = req.file.buffer;
    student.profileImage.contentType = req.file.mimetype;

    await student.save();

    res.status(200).send({
      success: true,
      message: "Profile image uploaded successfully",
      imageUrl: `/api/vedubuildApply/image/${student.emailId}`, // 👈 frontend ke liye URL
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Error uploading image" });
  }
};

// GET student profile image
export const getStudentImage = async (req, res) => {
  try {
    const { emailId } = req.params;
    const student = await studentModel.findOne({ emailId });

    if (!student || !student.profileImage || !student.profileImage.data) {
      return res.status(404).send("No image found");
    }

    res.set("Content-Type", student.profileImage.contentType);
    res.send(student.profileImage.data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching image");
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


// BULK APPLY - SOLID VERSION
export const bulkApplyController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "Please Upload file" 
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.worksheets[0];
    const rows = [];
    
    // ✅ Header cleanup (trim + lowercase + underscores)
    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values.slice(1).map((h) =>
      (h || "")
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
    );

    // ✅ Rows nikaalo
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      const rowVals = row.values.slice(1);
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = rowVals[idx] !== undefined ? rowVals[idx] : null;
      });
      rows.push(obj);
    });

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel File is Empty"
      });
    }

    let successCount = 0;
    let skipCount = 0;
    const errors = [];
    const existingAadhars = new Set();

    // ✅ Pehle se existing aadhar numbers nikaal lo
    const existingStudents = await studentModel.find({}, 'aadharNo');
    existingStudents.forEach(student => {
      if (student.aadharNo) {
        existingAadhars.add(student.aadharNo.toString().trim());
      }
    });

    // ✅ Process students one by one
    const studentsToInsert = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        
        // ✅ Required fields check karo
        if (!row.aadharno && !row.aadhar_no) {
          errors.push(`Row ${i + 2}: Aadhar number missing`);
          skipCount++;
          continue;
        }

        const aadharNo = String(row.aadharno || row.aadhar_no || "").trim();
        
        // ✅ Aadhar duplicate check (existing + current batch)
        if (existingAadhars.has(aadharNo)) {
          errors.push(`Row ${i + 2}: Aadhar ${aadharNo} already exists`);
          skipCount++;
          continue;
        }

        // ✅ Mobile number validation
        const mobileNo = row.mobileno || row.mobile;
        if (!mobileNo) {
          errors.push(`Row ${i + 2}: Mobile number missing`);
          skipCount++;
          continue;
        }

        const mobileStr = String(mobileNo).trim();
        if (mobileStr.length !== 10 || isNaN(mobileStr)) {
          errors.push(`Row ${i + 2}: Invalid mobile number ${mobileStr}`);
          skipCount++;
          continue;
        }

        // ✅ Password banayo
        const rawPassword = mobileStr; // Mobile number as password
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // ✅ Student object banao (CSV fields + default values)
        const studentData = {
          aplication_id: row.applicationid || row.application_id ,
          studentName: row.studentname || row.name || "",
          fatherName: row.fathername || row.father_name || "N/A", // Required field
          mobileNo: parseInt(mobileStr),
          emailId: row.emailid || row.email || "",
          password: hashedPassword,
          address: row.address || row.residence || "",
          city: row.city || "",
          district: row.district || "",
          pinCode: row.pincode || row.pin_code ? parseInt(row.pincode || row.pin_code) : null,
          schoolCollege: row.schoolcollege || row.college || "",
          boardName: row.boardname || row.board_name || "N/A", // Required field
          aadharNo: aadharNo,
          scholarship: row.scholarship || "General", // ✅ YEH LINE THIK KARI
          studentClass: row.studentclass || row.standard || "",
          combination: row.combination || "N/A",
          
          // ✅ Default values for non-CSV fields
          paymentStatus: row.paymentStatus,
          credentialsSentAt: null,
          otp: null,
          otpExpire: null,
          offersRedeemed: [],
          canDownloadCertificate: false
        };

        // ✅ Final validation - check all required fields
        const requiredFields = ['studentName', 'fatherName', 'mobileNo', 'emailId', 'address', 'city', 'district', 'pinCode', 'schoolCollege', 'boardName', 'aadharNo', 'scholarship'];
        const missingFields = requiredFields.filter(field => !studentData[field]);

        if (missingFields.length > 0) {
          errors.push(`Row ${i + 2}: Missing fields - ${missingFields.join(', ')}`);
          skipCount++;
          continue;
        }

        // ✅ Add to batch
        studentsToInsert.push(studentData);
        existingAadhars.add(aadharNo); // Current batch mein duplicate na ho
        successCount++;

      } catch (error) {
        errors.push(`Row ${i + 2}: ${error.message}`);
        skipCount++;
      }
    }

    // ✅ Database mein insert karo
    let insertResult = [];
    if (studentsToInsert.length > 0) {
      try {
        insertResult = await studentModel.insertMany(studentsToInsert, { 
          ordered: false 
        });
      } catch (insertError) {
        if (insertError.writeErrors) {
          // Duplicates handle karo
          const actuallyInserted = insertError.result?.nInserted || 0;
          successCount = actuallyInserted;
          skipCount += (studentsToInsert.length - actuallyInserted);
          
          insertError.writeErrors.forEach(error => {
            errors.push(`DB Error: ${error.errmsg}`);
          });
        } else {
          throw insertError;
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Ho gaya kaam! ${successCount} students add, ${skipCount} skip kare!`,
      inserted: successCount,
      skipped: skipCount,
      totalRows: rows.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined // First 10 errors dikhao
    });

  } catch (error) {
    console.error("Bhai student upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Server mein kuch gadbad hai!",
      error: error.message
    });
  }
};

//DOWNLOAD-EXCEL
export const downloadExcelController = async (req, res) => {
  try {
    const students = await studentModel
      .find(
        {},
        {
          aplication_id: 1,
          studentName: 1,
          fatherName: 1,
          mobileNo: 1,
          emailId: 1,
          address: 1,
          city: 1,
          district: 1,
          pinCode: 1,
          schoolCollege: 1,
          boardName: 1,
          aadharNo: 1,
          scholarship: 1,
          studentClass: 1,
          combination: 1,
          paymentStatus: 1,
          _id: 0,
        }
      )
      .lean();

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");

    // Define columns
    worksheet.columns = [
      { header: "Application ID", key: "aplication_id", width: 20 },
      { header: "Student Name", key: "studentName", width: 25 },
      { header: "Father Name", key: "fatherName", width: 25 },
      { header: "Mobile No ", key: "mobileNo", width: 15 },
      { header: "Email ID", key: "emailId", width: 25 },
      { header: "Address", key: "address", width: 30 },
      { header: "City", key: "city", width: 15 },
      { header: "District", key: "district", width: 15 },
      { header: "Pin Code", key: "pinCode", width: 10 },
      { header: "School/College", key: "schoolCollege", width: 25 },
      { header: "Board Name", key: "boardName", width: 15 }, // ✅ new
      { header: "Aadhar No", key: "aadharNo", width: 20 },
      { header: "Scholarship", key: "scholarship", width: 15 },
      { header: "Class", key: "studentClass", width: 15 },
      { header: "Combination", key: "combination", width: 15 },
      { header: "Payment Status", key: "paymentStatus", width: 15 }, // ✅ new
    ];

    // Add rows
    students.forEach((student) => worksheet.addRow(student));

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");

    // Write workbook to response
    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).json({
      success: false,
      message: "Error in GENERATE EXCEL API",
    });
  }
};

// STUDENT LOGIN
export const studentLoginController = async (req, res) => {
  try {
    const { aplication_id, password } = req.body;

    // ✅ Validation
    if (!aplication_id || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // ✅ Find user
    const user = await studentModel.findOne({ aplication_id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // ✅ Generate token
    const token = user.generateToken();

    // ✅ Send cookie + response
    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: true, // HTTPS only
        sameSite: "None", // cross-origin
        expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
      })
      .json({
        success: true,
        message: "Login successful",
        token,
        student: {
          _id:user._id,
          application_id: user.aplication_id,
          studentName: user.studentName,
          fatherName: user.fatherName,
          mobileNo: user.mobileNo,
          emailId: user.emailId,
          address: user.address,
          city: user.city,
          district: user.district,
          pinCode: user.pinCode,
          schoolCollege: user.schoolCollege,
          boardName: user.boardName,
          scholarship: user.scholarship,
          studentClass: user.studentClass,
          combination: user.combination,
          paymentStatus: user.paymentStatus,
          profileImage: user.profileImage,
        },
      });
  } catch (error) {
    console.error("Error in LOGIN API:", error);
    res.status(500).json({
      success: false,
      message: "Error in login API",
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
    const { aplication_id } = req.body;
    if (!aplication_id) {
      return res
        .status(400)
        .send({ success: false, message: "Application Id is required" });
    }

    const user = await studentModel.findOne({ aplication_id });
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
    console.log(`OTP FOR PASSWORD ${aplication_id} = ${otp} `),
      await sendEmail(
        user.emailId, // recipient
        "Your OTP for Reset Password", // subject
        "resetPassword", // template file (resetPassword.hbs)
        {
          name: user.studentName,
          email: user.emailId,
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
    const { aplication_id, otp, newPassword } = req.body;
    if (!aplication_id || !otp || !newPassword) {
      return res
        .status(400)
        .send({ success: false, message: "All fields are required" });
    }
    const user = await studentModel.findOne({
      aplication_id,
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

//TOTAL NUMBER OF STUDENTS
export const totalNumberOfstudent = async (req, res) => {
  try {
    // count total enquiries
    const total = await studentModel.countDocuments();

    res.status(200).send({
      success: true,
      message: "Total enquiries fetched successfully",
      totalStudents: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while fetching students count",
    });
  }
};

//UPDATE PAYMENT STATUS
export const updatePaymentStatusController = async (req, res) => {
  try {
    const student = await studentModel.findById(req.params.id);
    if (!student) {
      return res.status(404).send({ message: "Student not found" });
    }
    // Check current payment status
    if (student.paymentStatus === "Pending") {
      student.paymentStatus = "Success";
      await student.save();

      return res.status(200).json({
        success: true,
        message: "Payment status updated to success",
        student,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Payment status is already '${student.paymentStatus}'`,
      });
    }
  } catch (error) {
    console.error("Error updating payment status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//DELETE STUDENT BY ID
export const deleteStudentController = async (req ,res) => {
  try {
    const { id } = req.params;

    await studentModel.findByIdAndDelete(id);

    // Success response
    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteStudentController:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

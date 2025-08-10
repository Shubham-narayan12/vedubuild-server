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

    const aplication_id = generateAppID();

    //validation
    if (
      !aplication_id ||
      !name ||
      !number ||
      !email ||
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

    const student = await studentModel.create({
      aplication_id,
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
    const headers = headerRow.values.slice(1).map(h => (h || "").toString().trim());

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

    const studentsData = rows.map(r => ({
      aplication_id: generateAppID(),
      name: r.name ?? "",
      number: r.number ? Number(r.number) : (r.mobile ? Number(r.mobile) : null),
      email: r.email ?? "",
      addresh: r.addresh ?? r.address ?? r.residence ?? "",
      city: r.city ?? "",
      state: r.state ?? "",
      pincode: r.pincode ? Number(r.pincode) : null,
      college_name: r.college_name ?? r.college ?? "",
      aadhar_number: r.aadhar_number ? Number(r.aadhar_number) : (r.aadhar ? Number(r.aadhar) : null),
      program: r.program ?? r.course ?? "",
      classStd: r.classstd ?? r.class ?? r.standard ?? ""
    }));

    const filtered = studentsData.filter(s => s.aplication_id && s.name && s.number && s.email);
    const result = await studentModel.insertMany(filtered, { ordered: false });

    return res.status(200).json({
      message: "Upload processed",
      totalRows: rows.length,
      insertedCount: result.length,
      skippedCount: filtered.length - result.length
    });

  } catch (error) {
    if (error && error.writeErrors) {
      const inserted = error.result?.nInserted ?? 0;
      return res.status(200).json({
        message: "Upload done with some duplicates/errors skipped",
        insertedCount: inserted,
        skippedCount: filtered ? filtered.length - inserted : error.writeErrors.length,
        error: "Some rows skipped (duplicates or validation errors)"
      });
    }

    console.error("UploadStudentsExcel error:", error);
    return res.status(500).json({ message: "Server error processing file", error: error.message || error });
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

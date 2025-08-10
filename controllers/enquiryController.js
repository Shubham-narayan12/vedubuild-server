import enquiryModel from "../models/enquiryModel.js";
import ExcelJS from "exceljs";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

// SET PATH
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CREATE ENQUIRY
export const createEnquiryController = async (req, res) => {
  try {
    const { fullName, email, phone, message } = req.body;

    // Validate required fields
    if (!fullName || !email || !message) {
      return res.status(400).send({
        success: false,
        message: "Full name, email, and message are required.",
      });
    }

    const enquiry = await enquiryModel.create({
      fullName,
      email,
      phone,
      message,
    });

    res.status(201).send({
      success: true,
      message: "Enquiry created successfully.",
      enquiry,
    });
  } catch (error) {
    console.error("CREATE ENQUIRY ERROR:", error);
    res.status(500).send({
      success: false,
      message: error.message || "Error in CREATE ENQUIRY API",
    });
  }
};

// GET ALL ENQUIRIES
export const getAllEnquiryController = async (req, res) => {
  try {
    const enquiries = await enquiryModel.find({});
    res.status(200).send({
      success: true,
      message: "Fetched all enquiries.",
      enquiries,
    });
  } catch (error) {
    console.error("GET ALL ENQUIRIES ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Error in GET ALL ENQUIRY API",
    });
  }
};

// GET SINGLE ENQUIRY
export const getSingleEnquiryController = async (req, res) => {
  try {
    const enquiry = await enquiryModel.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).send({
        success: false,
        message: "Enquiry not found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Enquiry found.",
      enquiry,
    });
  } catch (error) {
    console.error("GET SINGLE ENQUIRY ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Error in GET SINGLE ENQUIRY API",
    });
  }
};

// DELETE SINGLE ENQUIRY
export const deleteSingleEnquiryController = async (req, res) => {
  try {
    const enquiry = await enquiryModel.findByIdAndDelete(req.params.id);

    if (!enquiry) {
      return res.status(404).send({
        success: false,
        message: "Enquiry not found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Enquiry deleted successfully.",
      enquiry,
    });
  } catch (error) {
    console.error("DELETE SINGLE ENQUIRY ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Error in DELETE SINGLE ENQUIRY API",
    });
  }
};

// DELETE ALL ENQUIRIES
export const deleteAllEnquiryController = async (req, res) => {
  try {
    await enquiryModel.deleteMany({});
    res.status(200).send({
      success: true,
      message: "All enquiries deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE ALL ENQUIRIES ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Error in DELETE ALL ENQUIRY API",
    });
  }
};

//DOWNLOAD ALL ENQUIRY IN EXCEL
export const downloadEnquiryExcelController = async (req, res) => {
  try {
    const enquires = await enquiryModel.find(
      {},
      {
        fullName: 1,
        email: 1,
        phone: 1,
        message: 1,
        date: 1,
        _id: 0,
      }
    );
    //create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Enquires");

    //add columns in excel file
    worksheet.columns = [
      { header: "Name", key: "fullName", width: 20 },
      { header: "Mobile Number", key: "phone", width: 15 },
      { header: "Email", key: "email", width: 30 },
      { header: "Address", key: "message", width: 45 },
      { header: "Date", key: "date", width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true }; // Bold text
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" }, // Yellow background
      };
      cell.alignment = { horizontal: "center" }; // Center align text
    });

    //Add rows
    enquires.forEach((enquire) => {
      worksheet.addRow(enquire);
    });

    //Set response header
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=Enquirys.xlsx");

    // Write workbook to response stream
    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in ENQUIRY GENERATE EXCEL API",
    });
  }
};

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import QRCode from "qrcode";
import { fileURLToPath } from "url";
import Student from "../models/studentModel.js";
import mongoose from "mongoose";
const { isValidObjectId } = mongoose;

// __dirname replacement in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load template config manually
const metaPath = path.join(__dirname, "../templates/metadata/vstar.json");
const meta = JSON.parse(await fs.readFile(metaPath, "utf-8"));

// Escape XML for SVG
function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function generateQRBuffer(data, size = 150) {
  return await QRCode.toBuffer(data, {
    width: size,
    margin: 1,
  });
}

function buildOverlaySVG(student, meta) {
  const f = meta.fields;
  return `
  <svg width="${meta.width}" height="${meta.height}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .text { font-family: Arial, sans-serif; fill: #000; }
      .label { font-family: Arial, sans-serif; fill: #000; font-size: 14px; }
    </style>
    <!-- Presented to -->
    <text x="${f.studentName.x}" y="${f.studentName.y}" font-size="${f.studentName.fontSize}" class="text">
      ${escapeXml(student.studentName || "N/A")}
    </text>
    <!-- Studying in ... at ... -->
    <text x="${f.studentClass.x}" y="${f.studentClass.y}" font-size="${f.studentClass.fontSize}" class="label">
      Studying in ${escapeXml(student.studentClass || "N/A")} at
    </text>
    <text x="${f.schoolCollege.x}" y="${f.schoolCollege.y}" font-size="${f.schoolCollege.fontSize}" class="text">
      ${escapeXml(student.schoolCollege || "N/A")}
    </text>
    <!-- for achieving of ... position -->
    <text x="${f.examRank.x}" y="${f.examRank.y}" font-size="${f.examRank.fontSize}" class="label">
      This Certificate is presented by VEDUBUILD AND ASSOCIATES for achieving of
    </text>
    <text x="${f.examRank.x + 200}" y="${f.examRank.y}" font-size="${f.examRank.fontSize}" class="text">
      ${escapeXml(student.examRank || "N/A")} position in
    </text>
    <text x="${f.examRank.x + 350}" y="${f.examRank.y}" font-size="${f.examRank.fontSize}" class="text">
      V-STAR scholarship exam.
    </text>
    <!-- Scholarship -->
    <text x="${f.scholarship.x}" y="${f.scholarship.y}" font-size="${f.scholarship.fontSize}" class="text">
      ${escapeXml(student.scholarship || "N/A")}
    </text>
    <!-- Issued Date -->
    <text x="${f.issuedDate.x}" y="${f.issuedDate.y}" font-size="${f.issuedDate.fontSize}" class="text">
      ${escapeXml(student.issuedDate)}
    </text>
    <!-- Application ID -->
    <text x="${f.application_id.x}" y="${f.application_id.y}" font-size="${f.application_id.fontSize}" class="text">
      ${escapeXml(student.aplication_id || "N/A")}
    </text>
  </svg>`;
}

export async function getCertificate(req, res) {
  try {
    const studentId = req.params.studentId;

    // Validate studentId
    if (!isValidObjectId(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    // ✅ Fetch student from DB
    const studentDoc = await Student.findById(studentId);
    if (!studentDoc) {
      return res.status(404).json({ message: "Student not found" });
    }

    // ✅ Map DB fields to overlay fields (added examRank as "First" default)
    const student = {
      studentName: studentDoc.studentName,
      studentClass: studentDoc.studentClass || "N/A",
      schoolCollege: studentDoc.schoolCollege,
      scholarship: studentDoc.scholarship,
      examRank: "First", // Hardcoded default value since no DB field
      issuedDate: new Date().toLocaleDateString("en-GB"),
      aplication_id: studentDoc.aplication_id,
    };

    // Build overlay SVG
    const svgOverlay = buildOverlaySVG(student, meta);

    // Generate QR (student info inside QR)
    const qrData = JSON.stringify({
      id: studentDoc._id.toString(),
      roll: student.aplication_id,
    });
    const qrBuffer = await generateQRBuffer(qrData, 120);

    // Load template image
    const basePath = path.join(__dirname, meta.image);
    const baseBuffer = await fs.readFile(basePath);

    // Composite everything
    const composites = [
      { input: Buffer.from(svgOverlay), top: 0, left: 0 },
      { input: qrBuffer, top: 600, left: 950 }, // adjust QR placement
    ];

    const outputBuffer = await sharp(baseBuffer)
      .composite(composites)
      .png()
      .toBuffer();

    // Return file
    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=certificate_${student.aplication_id}.png`
    );
    res.send(outputBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}
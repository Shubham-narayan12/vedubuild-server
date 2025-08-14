import syllabusModel from "../models/syllabusModel.js";

//UPLOAD SYLLABUS
export const syllabusUploadController = async (req, res) => {
  try {
    const {  studentClass } = req.body;
    const syllabus = new syllabusModel({
      filename: req.file.originalname,
      file: req.file.buffer,
      contentType: req.file.mimetype,
       studentClass,
    });
    await syllabus.save();
    res.status(201).send({
      success: true,
      message: "Syllabus Saved successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in SYLLABUS UPLOAD API",
    });
  }
};

//DOWNLOLAD SYLLABUS
export const syllabusDownloadController = async (req, res) => {
  try {
    const {  studentClass } = req.query;
    const syllabus = await syllabusModel.findOne({  studentClass });

    if (!syllabus) {
      return res.status(404).send({ message: "PDF not found" });
    }

    // Set headers
    res.set({
      "Content-Type": syllabus.contentType,
      "Content-Disposition": `attachment; filename="${syllabus.filename}"`,
    });
    res.send(syllabus.file);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in SYLLABUS DOWNLOAD API",
    });
  }
};

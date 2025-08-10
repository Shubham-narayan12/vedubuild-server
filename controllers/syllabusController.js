import syllabusModel from "../models/syllabusModel.js";

export const syllabusUploadController = async (req, res) => {
  try {
    const syllabus = new syllabusModel({
      filename: req.file.originalname,
      file: req.file.buffer,
      contentType: req.file.mimetype,
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

export const syllabusDownloadController = async (req, res) => {
  try {
    const { id } = req.params;
    const syllabus = await syllabusModel.findById(id);

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

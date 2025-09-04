import mongoose from "mongoose";

const syllabusSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  file: { type: Buffer, required: true },
  contentType: { type: String, required: true },
  studentClass:{
    type:String,
    required : true
  },
  scholarship:{
    type:String,
    required : true
  }
});
const syllabusModel = mongoose.model("Syllabus", syllabusSchema)
export default syllabusModel;

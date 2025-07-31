import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  aplication_id: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
    unique: [true, "Number is already in use"],
  },
  email: {
    type: String,
    required: true,
    unique: [true, "email already in use"],
  },
  addresh: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: Number,
    required: true,
  },
  college_name: {
    type: String,
    required: true,
  },
  aadhar_number: {
    type: Number,
    required: true,
    unique:[true,"aadhar already in used"]
  },
  program: {
    type: String,
    required: true,
  },
  classStd: {
    type: String,
    required: true,
  }
});

const studentModel = mongoose.model("Students" , studentSchema)
export default studentModel;

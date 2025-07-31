import studentModel from "../models/studentModel.js";

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

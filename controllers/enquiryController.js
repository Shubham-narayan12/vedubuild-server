import enquiryModel from "../models/enquiryModel.js";

//CREATE ENQUIRY
export const createEnquiryController = async (req, res) => {
  try {
    const { full_name, email, phone_number, subject, message } = req.body;
    //validation
    const enquiry = await enquiryModel.create({
      full_name,
      email,
      phone_number,
      subject,
      message,
    });
    res.status(201).send({
      success: true,
      message: "Enquiry Created",
      enquiry,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in CREATE ENQUIRY API",
    });
  }
};

//GET ALL ENRUIRY
export const getAllEnquiryController = async (req, res) => {
  try {
    const enquirys = await enquiryModel.find({});
    res.status(200).send({
      success: true,
      message: "Fetched All Enquiry",
      enquirys,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "ERROR IN GET ALL ENQUIRY API",
    });
  }
};

//GET SINGLE ENQUIRY
export const getSingleEnquiryController = async (req, res) => {
  try {
    const enquiry = await enquiryModel.findById(req.params.id);
    if (!enquiry) {
      res.status(404).send({
        success: false,
        message: "ENQUIRY NOT FOUND",
      });
    }
    res.status(200).send({
      success: true,
      message: "ENQUIRY is found",
      enquiry,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "ERROR IN GET SINGLE ENQUIRY API",
    });
  }
};

//DELETE SINGLE ENQUIRY
export const deleteSingleEnquiryController = async (req, res) => {
  try {
    const enquiry = await enquiryModel.findByIdAndDelete(req.params.id)
    res.status(200).send({
        success:true,
        message:"ENQUIRY IS DELETED",
        enquiry
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "ERROR IN DELETE SINGLE ENQUIRY API",
    });
  }
};

//DELETE ALL ENQUIRY
export const deleteAllEnquiryController = async (req, res) => {
  try {
    await enquiryModel.deleteMany({});
    res.status(200).send({
      success: true,
      message: "ALL DATA IS DELETED",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "ERROR IN DELETE ALL ENQUIRY API",
    });
  }
};

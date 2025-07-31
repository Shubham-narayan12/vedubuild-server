import express from "express";
import { createEnquiryController, deleteAllEnquiryController, deleteSingleEnquiryController, getAllEnquiryController, getSingleEnquiryController } from "../controllers/enquiryController.js";

//routes objects
const router = express.Router();

//==============ENQUIRY ROUTES===============

//CREATE ROUTES
router.post("/create", createEnquiryController);

//GET ALL ENRUIRY
router.get("/get-all",getAllEnquiryController)

//GET SINGLE ENQUIRY
router.get("/:id",getSingleEnquiryController)

//DELETE SINGLE ENQUIRY
router.delete("/:id",deleteSingleEnquiryController)

//DELET ALL ENQUIRY
router.delete("/all-enquiry",deleteAllEnquiryController)

export default router;
import express from "express";
import {
  createEnquiryController,
  deleteAllEnquiryController,
  deleteSingleEnquiryController,
  downloadEnquiryExcelController,
  getAllEnquiryController,
  getSingleEnquiryController,
} from "../controllers/enquiryController.js";
import { isAuth } from "../middlewares/authMiddleware.js";

//routes objects
const router = express.Router();

//==============ENQUIRY ROUTES===============

//CREATE ROUTES
router.post("/create", createEnquiryController);

//GET ALL ENRUIRY
router.get("/get-all", isAuth, getAllEnquiryController);

//GET SINGLE ENQUIRY
router.get("/:id", isAuth, getSingleEnquiryController);

//DELETE SINGLE ENQUIRY
router.delete("/:id", isAuth, deleteSingleEnquiryController);

//DELET ALL ENQUIRY
router.delete("/all-enquiry", isAuth, deleteAllEnquiryController);

//DOWNLOAD ALL ENQUIRES
router.get("/download/data",downloadEnquiryExcelController)

export default router;

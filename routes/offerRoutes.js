import express from "express";
import { upload } from "../middlewares/upload.js";
import {
  addCouponController,
  assignCouponController,
  checkCouponStatusController,
  createOfferController,
  deleteOfferController,
  editOfferController,
  getAllOffersController,
  offerImageUploadMiddleware,
  singleOfferDetailController,
  uploadCouponExcelController,
} from "../controllers/offerController.js";

//routes objects
const router = express.Router();

//==============EVENTS ROUTES===============

//CREATE OFFER
router.post("/create", offerImageUploadMiddleware, createOfferController);

//ADD COUPONS
router.post("/add-coupons", addCouponController);

//ASSIGN COUPON TO STUDENT
router.post("/assign-coupon", assignCouponController);

//DELETE OFFER
router.delete("/:id", deleteOfferController);

//EDIT OFFER
router.put("/:id", editOfferController);

//GET ALL OFFER'S
router.get("/get-all-offers", getAllOffersController);

//GET SINGLE OFFER DETAILS
router.get("/:id", singleOfferDetailController);

//CHECK COUPON STATUS
router.post("/check-coupon-status", checkCouponStatusController);

//ADD COUPON CODE FROM CSV
router.post(
  "/upload-coupons-excel",
  upload.single("file"), // file field name = file
  uploadCouponExcelController
);

export default router;

import OfferModel from "../models/offerModel.js";
import studentModel from "../models/studentModel.js";
import cloudinary from "../utils/cloudinary.js";
import multer from "multer";
import fs from "fs";
import XLSX from "xlsx";

// Multer config - store temp file locally
const upload = multer({ dest: "uploads/" });

//========================================================================================
//DELET IMAGE FROM CLOUDINARY HELPER FUNCTION
function getPublicIdFromUrl(url) {
  try {
    const parts = url.split("/");
    const fileName = parts.pop(); // abc123xyz.png
    const folderName = parts.pop(); // Vedubuild_Offers
    const publicId = `${folderName}/${fileName.split(".")[0]}`;
    return publicId;
  } catch (error) {
    return null;
  }
}
//======================================================================================

//CREATE OFFER CONTROLLER
export const createOfferController = async (req, res) => {
  try {
    const { offer_Name, description, payout, isActive } = req.body;
    const file = req.file;

    // 🔍 Basic validation
    if (!offer_Name || !description || !payout) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields and at least one coupon code.",
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto", // image, pdf, etc.
      folder: "Vedubuild_Offers",
    });

    // Delete local temp file
    fs.unlinkSync(file.path);

    // 💾 Create Offer
    const newOffer = new OfferModel({
      offer_Name,
      description,
      payout,
      offerImage: result.secure_url,
      isActive: isActive ?? true,
    });

    await newOffer.save();

    return res.status(201).json({
      success: true,
      message: "Offer created successfully!",
      offer: newOffer,
    });
  } catch (error) {
    console.error("❌ Error in createOfferController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating offer",
      error: error.message,
    });
  }
};

//ADD COUPON'S IN THE OFFER CONTROLLER
export const addCouponController = async (req, res) => {
  try {
    const { offerId, couponCodes } = req.body;

    // 🔍 Validation
    if (
      !offerId ||
      !couponCodes ||
      !Array.isArray(couponCodes) ||
      couponCodes.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Offer ID and at least one coupon code are required.",
      });
    }

    // 🔍 Find existing offer
    const offer = await OfferModel.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found.",
      });
    }

    // 🎫 Convert incoming codes to objects
    const newCoupons = couponCodes.map((code) => ({
      code,
      isUsed: false,
      assignedTo: null,
    }));

    // 💾 Add to existing coupons
    offer.couponCodes.push(...newCoupons);
    await offer.save();

    return res.status(200).json({
      success: true,
      message: `✅ ${newCoupons.length} new coupons added successfully to offer "${offer.offer_Name}".`,
      totalCoupons: offer.couponCodes.length,
      newlyAdded: newCoupons.length,
      offer,
    });
  } catch (error) {
    console.error("❌ Error in addCouponController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding coupons",
      error: error.message,
    });
  }
};

// 🎯ASSIGN AVAILABLE COUPON TO A STUDENT FOR A SPECIFIC OFFER
export const assignCouponController = async (req, res) => {
  try {
    const { offerId, studentId } = req.body;

    // 🧾 Validate input
    if (!offerId || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Offer ID and Student ID are required.",
      });
    }

    // 🔍 Find Offer
    const offer = await OfferModel.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found.",
      });
    }

    // 🎓 Find Student
    const student = await studentModel.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // ⚠️ Check if student already redeemed this offer
    const alreadyRedeemed = student.offersRedeemed.find(
      (r) => r.offerId.toString() === offerId
    );

    if (alreadyRedeemed) {
      return res.status(200).json({
        success: false,
        message: "This student has already redeemed this offer.",
      });
    }

    // 🎫 Find first unused coupon
    const availableCoupon = offer.couponCodes.find((coupon) => !coupon.isUsed);

    if (!availableCoupon) {
      return res.status(400).json({
        success: false,
        message: "No available coupons left for this offer.",
      });
    }

    // ✅ Assign coupon to student
    availableCoupon.isUsed = true;
    availableCoupon.assignedTo = studentId;

    // 🧾 Record redemption in student's profile
    student.offersRedeemed.push({
      offerId: offer._id,
      couponCode: availableCoupon.code,
    });

    // 💾 Save both documents
    await Promise.all([offer.save(), student.save()]);

    return res.status(200).json({
      success: true,
      message: `Coupon "${availableCoupon.code}" successfully assigned to ${student.studentName}.`,
      offerName: offer.offer_Name,
      assignedCoupon: {
        code: availableCoupon.code,
        assignedTo: student._id,
        studentName: student.studentName,
      },
    });
  } catch (error) {
    console.error("❌ Error in assignCouponController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while assigning coupon.",
      error: error.message,
    });
  }
};

// DELETE SINGLE OFFER
export const deleteOfferController = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the offer
    const offer = await OfferModel.findById(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    // 1️⃣ Extract public_id from Cloudinary URL
    const publicId = getPublicIdFromUrl(offer.offerImage);

    // 2️⃣ Delete image from Cloudinary
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    // 3️⃣ Delete offer from database
    await OfferModel.findByIdAndDelete(id);

    // 4️⃣ Remove this offer from all students' offersRedeemed
    await studentModel.updateMany(
      {},
      {
        $pull: { offersRedeemed: { offerId: id } },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Offer & image deleted successfully, and redeemed data cleaned",
    });
  } catch (error) {
    console.error("❌ Error in deleteOfferController:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting the offer",
      error: error.message,
    });
  }
};


// EDIT OFFER
export const editOfferController = async (req, res) => {
  try {
    const { id } = req.params; // URL se ID
    const updateData = req.body; // Jo fields update karne hain

    // Check offer exists
    const offer = await OfferModel.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    // Update offer
    const updatedOffer = await OfferModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // return updated document
    );

    return res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      updatedOffer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating the offer",
      error: error.message,
    });
  }
};

// GET ALL OFFERS + ACTIVE OFFERS + COUPON COUNTS
export const getAllOffersController = async (req, res) => {
  try {
    // All offers (latest first)
    const offers = await OfferModel.find().sort({ createdAt: -1 });

    // Only active offers
    const activeOffers = offers.filter((offer) => offer.isActive === true);

    // ----- COUNT TOTAL USED / UNUSED COUPON CODES -----
    let usedCount = 0;
    let unusedCount = 0;

    offers.forEach((offer) => {
      offer.couponCodes.forEach((coupon) => {
        if (coupon.isUsed) {
          usedCount++;
        } else {
          unusedCount++;
        }
      });
    });

    return res.status(200).json({
      success: true,
      message: "All offers fetched successfully",

      // Offer counts
      count: offers.length,
      activeCount: activeOffers.length,

      // Coupon counts
      totalUsedCoupons: usedCount,
      totalUnusedCoupons: unusedCount,

      // Data
      offers,
      activeOffers,
    });
  } catch (error) {
    console.error("❌ Error in getAllOffersController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching offers",
      error: error.message,
    });
  }
};

// GET OFFER DETAILS BY ID
export const singleOfferDetailController = async (req, res) => {
  try {
    const { id } = req.params; // URL se ID milti hai

    // Check id format
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Offer ID is required",
      });
    }

    // Offer find
    const offer = await OfferModel.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Offer details fetched successfully",
      offer,
    });
  } catch (error) {
    console.error("Error fetching offer details:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//CHECK ALLREADY REDEEMED STUDENT
export const checkCouponStatusController = async (req, res) => {
  try {
    const { offerId, aplication_id } = req.body;

    if (!offerId || !aplication_id) {
      return res.status(400).json({
        success: false,
        message: "Offer ID and Application ID are required.",
      });
    }

    // Find student using applicationId
    const student = await studentModel.findOne({ aplication_id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // Check if student has redeemed this offer
    const redeemed = student.offersRedeemed.find(
      (r) => r.offerId.toString() === offerId
    );

    if (redeemed) {
      return res.status(200).json({
        success: true,
        alreadyRedeemed: true,
        couponCode: redeemed.couponCode,
        redeemedAt: redeemed.redeemedAt,
      });
    }

    // If not redeemed
    return res.status(200).json({
      success: true,
      alreadyRedeemed: false,
    });
  } catch (error) {
    console.error("Error checking coupon status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//ADD BULK COUPON CODE FROM CSV
export const uploadCouponExcelController = async (req, res) => {
  try {
    const { offerId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No Excel file uploaded!",
      });
    }

    // Check offer exists
    const offer = await OfferModel.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found!",
      });
    }

    // Read Excel file from buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(worksheet);

    let added = 0;
    let skipped = 0;

    // Loop rows
    rows.forEach((row) => {
      const code = row.code?.toString().trim();

      if (!code) return; // empty row ignore

      const exists = offer.couponCodes.some((c) => c.code === code);

      if (exists) {
        skipped++;
      } else {
        offer.couponCodes.push({ code });
        added++;
      }
    });

    await offer.save();

    return res.status(200).json({
      success: true,
      message: "Coupons processed!",
      added,
      skipped,
      total: offer.couponCodes.length,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error uploading coupon Excel",
      error: err.message,
    });
  }
};

// Multer middleware
export const offerImageUploadMiddleware = upload.single("file");

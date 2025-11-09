import cloudinary from "../utils/cloudinary.js";
import multer from "multer";
import fs from "fs";
import bannerModel from "../models/bannerModel.js"; // <-- import model

// Multer config - store temp file locally
const upload = multer({ dest: "uploads/" });

// Upload controller
export const uploadBannerController = async (req, res) => {
  try {
    const file = req.file;
    const { name } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto", // image, pdf, etc.
      folder: "vedubuild_banners",
    });

    // Delete local temp file
    fs.unlinkSync(file.path);

    // Save to MongoDB
    const newBanner = new bannerModel({
      name: name || "Untitled Banner",
      photoUrl: result.secure_url,
    });
    await newBanner.save();

    res.status(201).json({
      success: true,
      message: "Banner uploaded successfully!",
      data: {
        name: newBanner.name,
        photoUrl: newBanner.photoUrl,
      },
    });
  } catch (error) {
    console.error("Error uploading banner:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL BANNERS CONTROLLER
export const getAllBannerController = async (req, res) => {
  try {
    // Fetch all banners from DB (latest first)
    const banners = await bannerModel.find().sort({ createdAt: -1 });

    // If no banners found
    if (!banners.length) {
      return res.status(404).json({
        success: false,
        message: "No banners found",
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      count: banners.length,
      banners: banners,
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


// Multer middleware
export const bannerUploadMiddleware = upload.single("file");

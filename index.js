// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// Imports
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

// DB Connection
import connectDb from "./config/db.js";

// Route Imports
import applyRoutes from "./routes/studentRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import syllabusRoutes from "./routes/syllabusRoutes.js"
import otpVerificationRoutes from "./routes/otpRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import certificateRoutes from "./routes/certificateRoutes.js"
import eventRoutes from "./routes/eventRoutes.js"
import uploadBannerRouter from "./routes/uploadRoutes.js"
import offerRouter from "./routes/offerRoutes.js"


// Connect to database
connectDb();

// Create Express app
const app = express();
const port = process.env.PORT || 8000;

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", // local development
  "https://vedubuild.org", // production domain
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // allow cookies
  })
);

// Middleware
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

// Routes
app.use("/api/vedubuildApply", applyRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/user", userRoutes);
app.use("/api/syllabus", syllabusRoutes);
app.use("/api/otp",otpVerificationRoutes);
app.use("/api/payment",paymentRoutes);
app.use("/api/certificate",certificateRoutes);
app.use("/api/events",eventRoutes);
app.use("/api/banner",uploadBannerRouter);
app.use("/api/offer",offerRouter);


// Test Route
app.get("/", (req, res) => {
  res.send("Hello from Vedubuild server!");
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

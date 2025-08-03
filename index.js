// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// Imports
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// DB Connection
import connectDb from "./config/db.js";

// Route Imports
import applyRoutes from "./routes/studentRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import userRoutes from "./routes/userRoutes.js";

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

// Routes
app.use("/api/vedubuildApply", applyRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/user", userRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Hello from Vedubuild server!");
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

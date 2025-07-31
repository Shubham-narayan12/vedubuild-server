//config
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDb from "./config/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

//Database connection
connectDb();

//rest object
const app = express();
const port = 8000;

//middleware
app.use(morgan("dev"));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

//routes import
import applyRoutes from "./routes/studentRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
app.use("/api/vedubuildApply", applyRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("hello");
});

app.listen(port, () => {
  console.log(`server running on port${port}`);
});

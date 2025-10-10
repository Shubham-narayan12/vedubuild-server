import express from "express";
import { getCertificate } from "../controllers/certificateController.js";

//routes objects
const router = express.Router();

router.get("/:studentId",getCertificate)

export default router;
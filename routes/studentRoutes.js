import express from "express"
import { applyController } from "../controllers/studentControllers.js";



//router object
const router = express.Router();


//routers
router.post("/apply",applyController)

export default router;
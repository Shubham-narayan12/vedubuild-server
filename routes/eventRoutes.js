import express from "express";
import { addEventController, deleteEventController, editEventController, getAllEventsController } from "../controllers/eventController.js";

//routes objects
const router = express.Router();

//==============EVENTS ROUTES===============

//ADD EVENTS
router.post("/create",addEventController)

//GET ALL EVENTS
router.get("/get-all-events",getAllEventsController)

//EDIT EVENTS
router.put("/:id",editEventController);

//DELETE EVENTS
router.delete("/:id",deleteEventController);

export default router;
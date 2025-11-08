import Event from "../models/eventModel.js";

//ADD EVENTS
export const addEventController = async (req, res) => {
  try {
    const { title, date, time, location, description } = req.body;

    // Validation - Check required fields
    if (!title || !date || !time || !location || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields except description are required",
      });
    }

    // Create new event
    const newEvent = new Event({
      title: title.trim(),
      date: new Date(date),
      time: time,
      location: location.trim(),
      description: description ? description.trim() : "",
    });

    // Save to database
    const savedEvent = await newEvent.save();

    // Success response
    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: {
        id: savedEvent._id,
        title: savedEvent.title,
        date: savedEvent.date,
        time: savedEvent.time,
        location: savedEvent.location,
        description: savedEvent.description,
        createdAt: savedEvent.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in addEventController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//GET ALL EVENTS DETAILS
export const getAllEventsController = async (req, res) => {
  try {
    // Get all events from database, sorted by date (newest first)
    const events = await Event.find()
      .sort({ date: 1, createdAt: -1 }) // Date ascending, creation time descending
      .select("-__v"); // Exclude version key

    // Format events for response
    const formattedEvents = events.map((event) => ({
      id: event._id,
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
    }));

    // Success response
    return res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      count: events.length,
      events: formattedEvents,
    });
  } catch (error) {
    console.error("Error in getAllEventsController:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const editEventController = async (req, res) => {
  try {
    const { id } = req.params; // Event ID from URL params
    const { title, date, time, location, description } = req.body;

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        date: new Date(date),
        time: time,
        location: location.trim(),
        description: description ? description.trim() : "",
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true } // Return updated document and run validations
    ).select("-__v");

    // Success response
    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: {
        id: updatedEvent._id,
        title: updatedEvent.title,
        date: updatedEvent.date,
        time: updatedEvent.time,
        location: updatedEvent.location,
        description: updatedEvent.description,
        createdAt: updatedEvent.createdAt,
        updatedAt: updatedEvent.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error in editEventController:", error);

    // Handle specific errors
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const deleteEventController = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete event from database
    await Event.findByIdAndDelete(id);

    // Success response
    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteEventController:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

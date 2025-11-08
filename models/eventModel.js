// models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Event title is required"],
    trim: true,
    maxlength: [100, "Event title cannot exceed 100 characters"],
  },
  date: {
    type: Date,
    required: [true, "Event date is required"],
  },
  time: {
    type: String,
    required: [true, "Event time is required"],
  },
  location: {
    type: String,
    required: [true, "Event location is required"],
    trim: true,
    maxlength: [200, "Location cannot exceed 200 characters"],
  },
  description: {
    type: String,
    required: [true, "Event location is required"],
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
eventSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Event = mongoose.model("Event", eventSchema);

export default Event;

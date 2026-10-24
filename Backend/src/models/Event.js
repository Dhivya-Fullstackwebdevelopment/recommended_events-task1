const { Schema, model } = require("mongoose");

const eventSchema = new Schema({
  id: { type: Number, required: true, unique: true }, // numeric id, same as the frontend expects
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, index: true },
  skills: { type: [String], index: true },
  startsAt: { type: Date, required: true, index: true },
  isOnline: { type: Boolean, required: true },
  location: { type: String, default: null },
  registrationUrl: { type: String, required: true },
});

module.exports = model("Event", eventSchema);
const { Schema, model } = require("mongoose");

const registrationSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    eventId: { type: Number, required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    experience: { type: String, required: true }, // validated against the experience_levels collection
    consent: { type: Boolean, required: true },
  },
  { timestamps: true }
);

// One registration per email per event
registrationSchema.index({ eventId: 1, email: 1 }, { unique: true });

module.exports = model("Registration", registrationSchema);

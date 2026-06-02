const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    ctcLpa: { type: Number, min: 0 },
    eligibility: { type: String, default: '' },
    driveDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Placement', placementSchema);

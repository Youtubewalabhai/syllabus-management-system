const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    eventDate: { type: Date, required: true },
    type: { type: String, enum: ['hackathon', 'workshop', 'seminar', 'fest', 'technical'], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);

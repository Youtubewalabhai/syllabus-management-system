const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['class', 'exam', 'deadline', 'holiday', 'announcement'], required: true, index: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    description: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);

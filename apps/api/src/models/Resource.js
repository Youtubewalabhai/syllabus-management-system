const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['syllabus', 'notes', 'question_paper', 'lab_manual', 'assignment', 'book', 'video'],
      required: true,
    },
    branch: { type: String, default: '' },
    semester: { type: Number, min: 1, max: 8 },
    subject: { type: String, default: '' },
    year: { type: Number },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);

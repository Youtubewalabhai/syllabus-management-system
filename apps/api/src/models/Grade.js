const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
    score: { type: Number, min: 0, max: 100, required: true },
    gradePoint: { type: Number, min: 0, max: 10, required: true },
    remarks: String
  },
  { timestamps: true }
);

gradeSchema.index({ student: 1, course: 1 });

module.exports = mongoose.model('Grade', gradeSchema);

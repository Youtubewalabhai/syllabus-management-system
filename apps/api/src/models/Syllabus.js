const mongoose = require('mongoose');

const syllabusVersionSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

const syllabusSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    semester: { type: Number, required: true, index: true },
    title: { type: String, required: true, index: true },
    currentVersion: { type: Number, default: 1 },
    versions: [syllabusVersionSchema]
  },
  { timestamps: true }
);

syllabusSchema.index({ title: 'text' });

module.exports = mongoose.model('Syllabus', syllabusSchema);

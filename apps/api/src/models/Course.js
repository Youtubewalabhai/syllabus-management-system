const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    semester: { type: Number, required: true, index: true },
    batch: { type: String, required: true, index: true },
    description: String,
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);

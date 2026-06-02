const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submittedAt: Date,
    status: { type: String, enum: ['pending', 'submitted', 'late'], default: 'pending' },
    fileUrl: String
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true },
    description: String,
    deadline: { type: Date, required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submissions: [submissionSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);

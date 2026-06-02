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

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    expectedCompletionDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
      index: true
    },
    completionDate: Date,
    remarks: { type: String, trim: true },
    pendingReason: { type: String, trim: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: Date
  },
  { _id: true }
);

const allocationHistorySchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    allocatedAt: { type: Date, default: Date.now },
    allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { _id: false }
);

const coverageUpdateSchema = new mongoose.Schema(
  {
    periodType: { type: String, enum: ['weekly', 'monthly'], required: true },
    status: { type: String, enum: ['not_started', 'in_progress', 'completed'], required: true },
    topic: { type: mongoose.Schema.Types.ObjectId, required: true },
    updateDate: { type: Date, default: Date.now },
    remarks: { type: String, trim: true },
    pendingReason: { type: String, trim: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { _id: true, timestamps: true }
);

const syllabusSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    semester: { type: Number, required: true, index: true },
    batch: { type: String, trim: true, index: true },
    title: { type: String, required: true, index: true },
    allocatedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    allocatedAt: Date,
    allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    allocationHistory: [allocationHistorySchema],
    topics: [topicSchema],
    coverageUpdates: [coverageUpdateSchema],
    currentVersion: { type: Number, default: 1 },
    versions: [syllabusVersionSchema]
  },
  { timestamps: true }
);

syllabusSchema.index({ title: 'text' });
syllabusSchema.index({ course: 1, semester: 1, title: 1 }, { unique: true });

syllabusSchema.virtual('completionPercentage').get(function completionPercentage() {
  if (!this.topics || this.topics.length === 0) return 0;
  const completedCount = this.topics.filter((topic) => topic.status === 'completed').length;
  return Math.round((completedCount / this.topics.length) * 100);
});

syllabusSchema.set('toJSON', { virtuals: true });
syllabusSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Syllabus', syllabusSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], required: true, index: true },
    profile: {
      phone: String,
      department: String,
      semester: Number,
      avatarUrl: String
    },
    passwordResetToken: String,
    passwordResetExpiry: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

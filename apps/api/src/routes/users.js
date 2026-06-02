const express = require('express');
const User = require('../models/User');
const mongoSanitize = require('mongo-sanitize');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authRequired, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub).select('-passwordHash -passwordResetToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

router.patch('/me', authRequired, async (req, res, next) => {
  try {
    const updates = { profile: mongoSanitize(req.body.profile || {}) };
    const user = await User.findByIdAndUpdate(req.user.sub, updates, { new: true }).select('-passwordHash -passwordResetToken');
    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

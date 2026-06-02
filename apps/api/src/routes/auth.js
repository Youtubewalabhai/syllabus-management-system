const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoSanitize = require('mongo-sanitize');
const { z } = require('zod');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { validateBody } = require('../middleware/validate');

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(['student', 'teacher', 'admin'])
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
});

router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const safeEmail = mongoSanitize(req.body.email);
    const existing = await User.findOne({ email: safeEmail });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({ ...req.body, email: safeEmail, passwordHash });
    const token = signToken({ sub: user._id, role: user.role, email: user.email });
    return res.status(201).json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const safeEmail = mongoSanitize(req.body.email);
    const user = await User.findOne({ email: safeEmail });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const matched = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!matched) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ sub: user._id, role: user.role, email: user.email });
    return res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
  } catch (error) {
    return next(error);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const email = mongoSanitize(req.body.email);
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (user) {
      user.passwordResetToken = crypto.randomBytes(20).toString('hex');
      user.passwordResetExpiry = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
    }
    return res.json({ message: 'If account exists, a reset link has been sent.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const token = mongoSanitize(req.body.token);
    const password = req.body.password;
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });
    const user = await User.findOne({ passwordResetToken: token, passwordResetExpiry: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();
    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

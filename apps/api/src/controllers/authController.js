const { z } = require('zod');
const User = require('../models/User');
const { signToken } = require('../services/tokenService');

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['student', 'faculty', 'department_admin', 'college_admin', 'super_admin']).optional(),
  branch: z.string().optional(),
  semester: z.number().min(1).max(8).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const register = async (req, res) => {
  try {
    const payload = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: payload.email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create(payload);
    const token = signToken({ sub: user._id.toString(), role: user.role, email: user.email });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branch: user.branch,
        semester: user.semester,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: error.flatten() });
    return res.status(500).json({ message: 'Unable to register user' });
  }
};

const login = async (req, res) => {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await User.findOne({ email: payload.email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const matched = await user.comparePassword(payload.password);
    if (!matched) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ sub: user._id.toString(), role: user.role, email: user.email });
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: error.flatten() });
    return res.status(500).json({ message: 'Unable to login user' });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch profile' });
  }
};

module.exports = { register, login, me };

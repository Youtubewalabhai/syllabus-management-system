const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

const auth = (roles = []) => (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (roles.length > 0 && !roles.includes(payload.role)) {
      return res.status(403).json({ message: 'Insufficient role permissions' });
    }
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { auth };

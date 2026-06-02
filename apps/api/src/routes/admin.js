const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Syllabus = require('../models/Syllabus');
const AuditLog = require('../models/AuditLog');
const { authRequired } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

const router = express.Router();

router.get('/stats', authRequired, allowRoles('admin'), async (req, res, next) => {
  try {
    const [users, courses, assignments, syllabi] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Assignment.countDocuments(),
      Syllabus.countDocuments()
    ]);
    return res.json({ users, courses, assignments, syllabi });
  } catch (error) {
    return next(error);
  }
});

router.get('/audit-logs', authRequired, allowRoles('admin'), async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    return res.json(logs);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

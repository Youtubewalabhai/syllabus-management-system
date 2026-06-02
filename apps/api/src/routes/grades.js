const express = require('express');
const Grade = require('../models/Grade');
const { authRequired } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

const router = express.Router();

router.post('/', authRequired, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const grade = await Grade.create(req.body);
    return res.status(201).json(grade);
  } catch (error) {
    return next(error);
  }
});

router.get('/student/:studentId', authRequired, async (req, res, next) => {
  try {
    if (req.user.role === 'student' && req.user.sub !== req.params.studentId) {
      return res.status(403).json({ message: 'Cannot access other student grades' });
    }

    const grades = await Grade.find({ student: req.params.studentId }).populate('course', 'title code');
    const gpa = grades.length ? grades.reduce((sum, item) => sum + item.gradePoint, 0) / grades.length : 0;
    return res.json({ gpa: Number(gpa.toFixed(2)), grades });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

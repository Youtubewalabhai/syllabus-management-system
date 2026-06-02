const express = require('express');
const Assignment = require('../models/Assignment');
const mongoSanitize = require('mongo-sanitize');
const { authRequired } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

const router = express.Router();

router.get('/', authRequired, async (req, res, next) => {
  try {
    const query = {};
    if (req.query.course) query.course = mongoSanitize(req.query.course);
    const data = await Assignment.find(query).populate('course', 'title code');
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

router.post('/', authRequired, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const created = await Assignment.create({ ...req.body, createdBy: req.user.sub });
    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/submit', authRequired, allowRoles('student'), async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    const existing = assignment.submissions.find((entry) => String(entry.student) === String(req.user.sub));
    const status = new Date() > new Date(assignment.deadline) ? 'late' : 'submitted';

    if (existing) {
      existing.submittedAt = new Date();
      existing.status = status;
      existing.fileUrl = req.body.fileUrl;
    } else {
      assignment.submissions.push({ student: req.user.sub, submittedAt: new Date(), status, fileUrl: req.body.fileUrl });
    }

    await assignment.save();
    return res.json(assignment);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

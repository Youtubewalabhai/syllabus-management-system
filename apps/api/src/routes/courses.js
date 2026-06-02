const express = require('express');
const Course = require('../models/Course');
const mongoSanitize = require('mongo-sanitize');
const { authRequired } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

const router = express.Router();

router.get('/', authRequired, async (req, res, next) => {
  try {
    const query = {};
    if (req.query.semester) query.semester = Number(mongoSanitize(req.query.semester));
    if (req.query.batch) query.batch = mongoSanitize(req.query.batch);
    const data = await Course.find(query).populate('teacher', 'name email').populate('students', 'name email');
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

router.post('/', authRequired, allowRoles('admin'), async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    return res.status(201).json(course);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

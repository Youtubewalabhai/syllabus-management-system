const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const courseRoutes = require('./courses');
const syllabusRoutes = require('./syllabi');
const assignmentRoutes = require('./assignments');
const gradeRoutes = require('./grades');
const eventRoutes = require('./events');
const notificationRoutes = require('./notifications');
const adminRoutes = require('./admin');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'syllabus-api' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/syllabi', syllabusRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/grades', gradeRoutes);
router.use('/events', eventRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

module.exports = router;

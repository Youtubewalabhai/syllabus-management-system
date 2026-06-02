const express = require('express');
const path = require('path');
const multer = require('multer');
const { z } = require('zod');
const Syllabus = require('../models/Syllabus');
const Course = require('../models/Course');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const mongoSanitize = require('mongo-sanitize');
const { authRequired } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const { validateBody } = require('../middleware/validate');

const router = express.Router();

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});

const upload = multer({
  storage: uploadStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') return cb(new Error('Only PDF uploads are allowed'));
    return cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

const topicInputSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().max(500).optional().default(''),
  expectedCompletionDate: z.coerce.date()
});

const createSyllabusSchema = z.object({
  course: z.string().min(1),
  semester: z.coerce.number().int().min(1).max(20),
  batch: z.string().min(1).max(50).optional().default(''),
  title: z.string().min(2).max(200),
  allocatedTeacher: z.string().optional(),
  topics: z.array(topicInputSchema).min(1, 'At least one topic is required')
});

const allocationSchema = z.object({
  teacherId: z.string().min(1)
});

const progressUpdateSchema = z.object({
  status: z.enum(['not_started', 'in_progress', 'completed']),
  periodType: z.enum(['weekly', 'monthly']),
  updateDate: z.coerce.date().optional(),
  remarks: z.string().max(500).optional(),
  pendingReason: z.string().max(500).optional()
});

function sanitizeText(value) {
  return value ? mongoSanitize(value).trim() : '';
}

function toTopicPayload(topics) {
  return topics.map((topic) => ({
    title: sanitizeText(topic.title),
    description: sanitizeText(topic.description),
    expectedCompletionDate: topic.expectedCompletionDate,
    status: 'not_started'
  }));
}

function computeDerivedReport(syllabus) {
  const topicCount = syllabus.topics.length;
  const completed = syllabus.topics.filter((topic) => topic.status === 'completed').length;
  const inProgress = syllabus.topics.filter((topic) => topic.status === 'in_progress').length;
  const notStarted = topicCount - completed - inProgress;
  const now = new Date();
  const overdue = syllabus.topics.filter(
    (topic) => topic.status !== 'completed' && topic.expectedCompletionDate && new Date(topic.expectedCompletionDate) < now
  ).length;
  const completionPercentage = topicCount ? Math.round((completed / topicCount) * 100) : 0;

  return {
    topicCount,
    completed,
    inProgress,
    notStarted,
    overdue,
    completionPercentage,
    pending: topicCount - completed
  };
}

function canTeacherUpdate(syllabus, user) {
  if (user.role === 'admin') return true;
  return user.role === 'teacher' && syllabus.allocatedTeacher && String(syllabus.allocatedTeacher) === String(user.sub);
}

function toCsv(summary, rows) {
  const headerRows = [
    ['totalSyllabi', summary.totalSyllabi],
    ['averageCompletionPercentage', summary.averageCompletionPercentage],
    ['pendingTopics', summary.pendingTopics],
    ['overdueTopics', summary.overdueTopics],
    ['lowProgressAlerts', summary.lowProgressAlerts]
  ];
  const detailHeader = ['syllabusId', 'title', 'courseCode', 'courseTitle', 'semester', 'batch', 'completionPercentage', 'pending', 'overdue'];
  const detailRows = rows.map((item) => [
    item.syllabusId,
    item.title,
    item.courseCode,
    item.courseTitle,
    item.semester,
    item.batch,
    item.completionPercentage,
    item.pending,
    item.overdue
  ]);
  const rowsToSerialize = [...headerRows, [], detailHeader, ...detailRows];
  return rowsToSerialize
    .map((row) =>
      row
        .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
}

router.get('/', authRequired, async (req, res, next) => {
  try {
    const query = {};
    if (req.query.course) query.course = mongoSanitize(req.query.course);
    if (req.query.semester) query.semester = Number(mongoSanitize(req.query.semester));
    if (req.query.batch) query.batch = mongoSanitize(req.query.batch);
    if (req.query.teacher) query.allocatedTeacher = mongoSanitize(req.query.teacher);
    if (req.query.fromDate || req.query.toDate) {
      query.createdAt = {};
      if (req.query.fromDate) query.createdAt.$gte = new Date(mongoSanitize(req.query.fromDate));
      if (req.query.toDate) query.createdAt.$lte = new Date(mongoSanitize(req.query.toDate));
    }
    if (req.query.search) query.$text = { $search: mongoSanitize(req.query.search) };
    const data = await Syllabus.find(query)
      .populate('course')
      .populate('allocatedTeacher', 'name email')
      .sort({ createdAt: -1 });
    const response = data.map((syllabus) => ({
      ...syllabus.toJSON(),
      report: computeDerivedReport(syllabus)
    }));
    return res.json(response);
  } catch (error) {
    return next(error);
  }
});

router.post('/', authRequired, allowRoles('teacher', 'admin'), validateBody(createSyllabusSchema), async (req, res, next) => {
  try {
    const course = mongoSanitize(req.body.course);
    const semester = req.body.semester;
    const batch = sanitizeText(req.body.batch);
    const title = sanitizeText(req.body.title);
    const allocatedTeacher = req.user.role === 'teacher' ? String(req.user.sub) : req.body.allocatedTeacher ? mongoSanitize(req.body.allocatedTeacher) : undefined;

    const courseData = await Course.findById(course).select('batch semester');
    if (!courseData) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (courseData.semester !== semester) {
      return res.status(400).json({ message: 'Semester does not match selected course' });
    }

    const created = await Syllabus.create({
      course,
      semester,
      batch: batch || courseData.batch,
      title,
      allocatedTeacher,
      allocatedAt: allocatedTeacher ? new Date() : undefined,
      allocatedBy: allocatedTeacher ? req.user.sub : undefined,
      allocationHistory: allocatedTeacher ? [{ teacher: allocatedTeacher, allocatedAt: new Date(), allocatedBy: req.user.sub }] : [],
      topics: toTopicPayload(req.body.topics),
      currentVersion: 0,
      versions: []
    });

    if (allocatedTeacher) {
      await AuditLog.create({
        actor: req.user.sub,
        action: 'syllabus.allocated',
        entity: 'Syllabus',
        entityId: String(created._id),
        metadata: { teacherId: allocatedTeacher }
      });
    }

    return res.status(201).json(created);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'A syllabus with same course, semester and title already exists' });
    }
    return next(error);
  }
});

router.post(
  '/:id/upload',
  authRequired,
  allowRoles('teacher', 'admin'),
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'PDF file is required' });
      const syllabus = await Syllabus.findById(req.params.id);
      if (!syllabus) return res.status(404).json({ message: 'Syllabus not found' });
      if (!canTeacherUpdate(syllabus, req.user)) return res.status(403).json({ message: 'Insufficient permissions' });

      const fileRecord = {
        version: syllabus.currentVersion + 1,
        fileName: req.file.filename,
        filePath: req.file.path,
        uploadedBy: req.user.sub
      };
      syllabus.currentVersion += 1;
      syllabus.versions.push(fileRecord);
      await syllabus.save();

      await AuditLog.create({
        actor: req.user.sub,
        action: 'syllabus.version_uploaded',
        entity: 'Syllabus',
        entityId: String(syllabus._id),
        metadata: { version: syllabus.currentVersion }
      });

      return res.json(syllabus);
    } catch (error) {
      return next(error);
    }
  }
);

router.patch('/:id/allocation', authRequired, allowRoles('admin'), validateBody(allocationSchema), async (req, res, next) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus) return res.status(404).json({ message: 'Syllabus not found' });

    const teacherId = mongoSanitize(req.body.teacherId);
    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' }).select('_id');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    if (syllabus.allocatedTeacher && String(syllabus.allocatedTeacher) === teacherId) {
      return res.status(409).json({ message: 'Teacher is already allocated for this syllabus' });
    }

    syllabus.allocatedTeacher = teacherId;
    syllabus.allocatedAt = new Date();
    syllabus.allocatedBy = req.user.sub;
    syllabus.allocationHistory.push({ teacher: teacherId, allocatedAt: new Date(), allocatedBy: req.user.sub });
    await syllabus.save();

    await AuditLog.create({
      actor: req.user.sub,
      action: 'syllabus.reallocated',
      entity: 'Syllabus',
      entityId: String(syllabus._id),
      metadata: { teacherId }
    });

    return res.json(syllabus);
  } catch (error) {
    return next(error);
  }
});

router.patch(
  '/:id/topics/:topicId/progress',
  authRequired,
  allowRoles('teacher', 'admin'),
  validateBody(progressUpdateSchema),
  async (req, res, next) => {
    try {
      const syllabus = await Syllabus.findById(req.params.id);
      if (!syllabus) return res.status(404).json({ message: 'Syllabus not found' });
      if (!canTeacherUpdate(syllabus, req.user)) return res.status(403).json({ message: 'Insufficient permissions' });

      const topic = syllabus.topics.id(req.params.topicId);
      if (!topic) return res.status(404).json({ message: 'Topic not found' });

      topic.status = req.body.status;
      topic.remarks = sanitizeText(req.body.remarks);
      topic.pendingReason = sanitizeText(req.body.pendingReason);
      topic.updatedAt = req.body.updateDate || new Date();
      topic.updatedBy = req.user.sub;
      topic.completionDate = req.body.status === 'completed' ? req.body.updateDate || new Date() : undefined;

      syllabus.coverageUpdates.push({
        periodType: req.body.periodType,
        status: req.body.status,
        topic: topic._id,
        updateDate: req.body.updateDate || new Date(),
        remarks: sanitizeText(req.body.remarks),
        pendingReason: sanitizeText(req.body.pendingReason),
        updatedBy: req.user.sub
      });

      await syllabus.save();

      await AuditLog.create({
        actor: req.user.sub,
        action: 'syllabus.progress_updated',
        entity: 'Syllabus',
        entityId: String(syllabus._id),
        metadata: { topicId: String(topic._id), status: req.body.status, periodType: req.body.periodType }
      });

      return res.json({ syllabus, report: computeDerivedReport(syllabus) });
    } catch (error) {
      return next(error);
    }
  }
);

router.get('/reports/summary', authRequired, async (req, res, next) => {
  try {
    const query = {};
    if (req.query.course) query.course = mongoSanitize(req.query.course);
    if (req.query.semester) query.semester = Number(mongoSanitize(req.query.semester));
    if (req.query.batch) query.batch = mongoSanitize(req.query.batch);
    if (req.query.teacher) query.allocatedTeacher = mongoSanitize(req.query.teacher);
    if (req.query.fromDate || req.query.toDate) {
      query.createdAt = {};
      if (req.query.fromDate) query.createdAt.$gte = new Date(mongoSanitize(req.query.fromDate));
      if (req.query.toDate) query.createdAt.$lte = new Date(mongoSanitize(req.query.toDate));
    }

    const syllabi = await Syllabus.find(query)
      .populate('course', 'code title batch semester')
      .populate('allocatedTeacher', 'name email');

    const reportRows = syllabi.map((syllabus) => {
      const report = computeDerivedReport(syllabus);
      return {
        syllabusId: String(syllabus._id),
        title: syllabus.title,
        courseId: syllabus.course?._id ? String(syllabus.course._id) : '',
        courseCode: syllabus.course?.code || '',
        courseTitle: syllabus.course?.title || '',
        teacherId: syllabus.allocatedTeacher?._id ? String(syllabus.allocatedTeacher._id) : '',
        teacherName: syllabus.allocatedTeacher?.name || '',
        semester: syllabus.semester,
        batch: syllabus.batch || syllabus.course?.batch || '',
        completionPercentage: report.completionPercentage,
        completed: report.completed,
        pending: report.pending,
        overdue: report.overdue
      };
    });

    const groupedTeacher = reportRows.reduce((acc, row) => {
      const key = row.teacherId || 'unallocated';
      const existing = acc[key] || { teacherId: row.teacherId, teacherName: row.teacherName || 'Unallocated', completionTotal: 0, count: 0 };
      existing.completionTotal += row.completionPercentage;
      existing.count += 1;
      acc[key] = existing;
      return acc;
    }, {});

    const teacherWise = Object.values(groupedTeacher).map((item) => ({
      teacherId: item.teacherId,
      teacherName: item.teacherName,
      averageCompletionPercentage: item.count ? Math.round(item.completionTotal / item.count) : 0
    }));

    const groupedSemester = reportRows.reduce((acc, row) => {
      const key = row.semester;
      const existing = acc[key] || { semester: row.semester, completionTotal: 0, count: 0 };
      existing.completionTotal += row.completionPercentage;
      existing.count += 1;
      acc[key] = existing;
      return acc;
    }, {});

    const semesterWise = Object.values(groupedSemester).map((item) => ({
      semester: item.semester,
      averageCompletionPercentage: item.count ? Math.round(item.completionTotal / item.count) : 0
    }));

    const summary = {
      totalSyllabi: reportRows.length,
      averageCompletionPercentage: reportRows.length
        ? Math.round(reportRows.reduce((sum, row) => sum + row.completionPercentage, 0) / reportRows.length)
        : 0,
      pendingTopics: reportRows.reduce((sum, row) => sum + row.pending, 0),
      overdueTopics: reportRows.reduce((sum, row) => sum + row.overdue, 0),
      lowProgressAlerts: reportRows.filter((row) => row.completionPercentage < 50).length
    };

    if (req.query.export === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="syllabus-summary.csv"');
      return res.send(toCsv(summary, reportRows));
    }

    return res.json({
      summary,
      reports: {
        coverage: reportRows.map((row) => ({
          syllabusId: row.syllabusId,
          title: row.title,
          completed: row.completed,
          pending: row.pending
        })),
        completion: reportRows,
        backlog: reportRows.filter((row) => row.pending > 0 || row.overdue > 0)
      },
      teacherWise,
      semesterWise,
      alerts: {
        overdue: reportRows.filter((row) => row.overdue > 0).map((row) => ({ syllabusId: row.syllabusId, title: row.title, overdue: row.overdue })),
        lowProgress: reportRows
          .filter((row) => row.completionPercentage < 50)
          .map((row) => ({ syllabusId: row.syllabusId, title: row.title, completionPercentage: row.completionPercentage }))
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/report', authRequired, async (req, res, next) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id)
      .populate('course', 'code title')
      .populate('allocatedTeacher', 'name email');
    if (!syllabus) return res.status(404).json({ message: 'Syllabus not found' });
    return res.json({ syllabus, report: computeDerivedReport(syllabus) });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/download', authRequired, async (req, res, next) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus || !syllabus.versions.length) return res.status(404).json({ message: 'Syllabus not found' });
    const latest = syllabus.versions[syllabus.versions.length - 1];
    return res.download(latest.filePath, latest.fileName);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

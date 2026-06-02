const express = require('express');
const path = require('path');
const multer = require('multer');
const Syllabus = require('../models/Syllabus');
const mongoSanitize = require('mongo-sanitize');
const { authRequired } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

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

router.get('/', authRequired, async (req, res, next) => {
  try {
    const query = {};
    if (req.query.course) query.course = mongoSanitize(req.query.course);
    if (req.query.semester) query.semester = Number(mongoSanitize(req.query.semester));
    if (req.query.search) query.$text = { $search: mongoSanitize(req.query.search) };
    const data = await Syllabus.find(query).populate('course');
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

router.post('/', authRequired, allowRoles('teacher', 'admin'), upload.single('file'), async (req, res, next) => {
  try {
    const course = mongoSanitize(req.body.course);
    const semester = Number(mongoSanitize(req.body.semester));
    const title = mongoSanitize(req.body.title);
    const syllabus = await Syllabus.findOne({ course, semester, title });
    const fileRecord = {
      version: syllabus ? syllabus.currentVersion + 1 : 1,
      fileName: req.file.filename,
      filePath: req.file.path,
      uploadedBy: req.user.sub
    };

    if (!syllabus) {
      const created = await Syllabus.create({ course, semester, title, currentVersion: 1, versions: [fileRecord] });
      return res.status(201).json(created);
    }

    syllabus.currentVersion += 1;
    syllabus.versions.push(fileRecord);
    await syllabus.save();
    return res.json(syllabus);
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

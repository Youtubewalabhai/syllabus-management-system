const express = require('express');
const Event = require('../models/Event');
const { authRequired } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

const router = express.Router();

router.get('/', authRequired, async (req, res, next) => {
  try {
    const events = await Event.find().sort({ startAt: 1 });
    return res.json(events);
  } catch (error) {
    return next(error);
  }
});

router.post('/', authRequired, allowRoles('teacher', 'admin'), async (req, res, next) => {
  try {
    const created = await Event.create(req.body);
    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

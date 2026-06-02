const express = require('express');
const Notification = require('../models/Notification');
const { authRequired } = require('../middleware/auth');
const { createInAppNotification, sendEmailNotification, sendSmsNotification } = require('../services/notificationService');

const router = express.Router();

router.get('/', authRequired, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.sub }).sort({ createdAt: -1 }).limit(50);
    return res.json(notifications);
  } catch (error) {
    return next(error);
  }
});

router.post('/', authRequired, async (req, res, next) => {
  try {
    const { user, title, message, channel } = req.body;
    const record = await createInAppNotification({ user, title, message, channel: channel || 'in-app' });
    if (channel === 'email') await sendEmailNotification({ to: req.body.email, subject: title, body: message });
    if (channel === 'sms') await sendSmsNotification({ to: req.body.phone, body: message });
    return res.status(201).json(record);
  } catch (error) {
    return next(error);
  }
});

router.get('/stream', authRequired, async (req, res, next) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const interval = setInterval(async () => {
      const latest = await Notification.find({ user: req.user.sub }).sort({ createdAt: -1 }).limit(5);
      res.write(`data: ${JSON.stringify(latest)}\n\n`);
    }, 10000);

    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

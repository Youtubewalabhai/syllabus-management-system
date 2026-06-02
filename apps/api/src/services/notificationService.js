const Notification = require('../models/Notification');

async function createInAppNotification({ user, title, message, channel = 'in-app' }) {
  return Notification.create({ user, title, message, channel });
}

async function sendEmailNotification({ to, subject, body }) {
  if (!to) return;
  // Placeholder for production SMTP provider integration.
  // eslint-disable-next-line no-console
  console.log(`[email] to=${to} subject=${subject} body=${body}`);
}

async function sendSmsNotification({ to, body }) {
  if (!to) return;
  // Placeholder for production SMS provider integration.
  // eslint-disable-next-line no-console
  console.log(`[sms] to=${to} body=${body}`);
}

module.exports = { createInAppNotification, sendEmailNotification, sendSmsNotification };

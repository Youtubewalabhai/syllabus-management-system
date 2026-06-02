const express = require('express');
const {
  getPlatformOverview,
  listResources,
  listNotices,
  listEvents,
  listPlacements,
} = require('../controllers/catalogController');

const router = express.Router();

router.get('/overview', getPlatformOverview);
router.get('/resources', listResources);
router.get('/notices', listNotices);
router.get('/events', listEvents);
router.get('/placements', listPlacements);

module.exports = router;

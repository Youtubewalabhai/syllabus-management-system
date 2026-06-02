const Resource = require('../models/Resource');
const Notice = require('../models/Notice');
const Event = require('../models/Event');
const Placement = require('../models/Placement');

const parseQuery = (query) => {
  const filters = { ...query };
  ['semester', 'year'].forEach((key) => {
    if (filters[key] !== undefined) filters[key] = Number(filters[key]);
  });
  return filters;
};

const listFactory = (Model) => async (req, res) => {
  try {
    const filters = parseQuery(req.query);
    const items = await Model.find(filters).sort({ createdAt: -1 }).limit(100).lean();
    return res.status(200).json({ count: items.length, items });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch records' });
  }
};

const getPlatformOverview = (_req, res) => {
  const modules = [
    'Academic Hub',
    'Question Paper Portal',
    'University Notice System',
    'AI Assistant',
    'CGPA & GPA Module',
    'Attendance Management',
    'Timetable Management',
    'Placement Portal',
    'Career Development Center',
    'Project Hub',
    'Community Platform',
    'Event Management',
    'Scholarship Portal',
    'Alumni Network',
    'Admin Panel',
    'Analytics Dashboard',
  ];

  return res.status(200).json({
    project: 'StudentOS',
    vision: 'Single digital platform for all student needs',
    modules,
    roles: ['student', 'faculty', 'department_admin', 'college_admin', 'super_admin'],
  });
};

module.exports = {
  getPlatformOverview,
  listResources: listFactory(Resource),
  listNotices: listFactory(Notice),
  listEvents: listFactory(Event),
  listPlacements: listFactory(Placement),
};

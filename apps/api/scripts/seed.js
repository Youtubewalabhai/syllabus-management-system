require('dotenv').config();
const mongoose = require('mongoose');
const { env } = require('../src/config/env');
const Notice = require('../src/models/Notice');
const Resource = require('../src/models/Resource');
const Event = require('../src/models/Event');
const Placement = require('../src/models/Placement');

const run = async () => {
  if (!env.MONGO_URI) throw new Error('MONGO_URI is required for seed');
  await mongoose.connect(env.MONGO_URI);

  await Promise.all([Notice.deleteMany({}), Resource.deleteMany({}), Event.deleteMany({}), Placement.deleteMany({})]);

  await Notice.insertMany([
    { title: 'BEU Exam Form Open', body: 'Submit exam form before deadline.', category: 'exam' },
    { title: 'Scholarship Renewal', body: 'Apply through portal by 15th.', category: 'scholarship' },
  ]);

  await Resource.insertMany([
    {
      title: 'DAA Syllabus - Semester 4',
      type: 'syllabus',
      branch: 'CSE',
      semester: 4,
      subject: 'DAA',
      year: 2026,
      url: 'https://example.com/syllabus-daa.pdf',
    },
  ]);

  await Event.insertMany([
    {
      title: 'Campus Hackathon',
      description: '24-hour innovation challenge',
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      type: 'hackathon',
    },
  ]);

  await Placement.insertMany([
    {
      company: 'TechCorp',
      role: 'Software Engineer Intern',
      ctcLpa: 8,
      eligibility: 'CGPA 7+',
      driveDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  ]);

  // eslint-disable-next-line no-console
  console.log('Seed data inserted successfully');
  await mongoose.disconnect();
};

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});

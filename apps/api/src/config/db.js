const mongoose = require('mongoose');
const env = require('./env');

async function connectDb() {
  if (env.nodeEnv === 'test') return;
  await mongoose.connect(env.mongoUri, { autoIndex: true });
}

module.exports = { connectDb };

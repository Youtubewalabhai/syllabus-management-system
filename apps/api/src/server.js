require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const { env } = require('./config/env');

const start = async () => {
  try {
    if (env.MONGO_URI) {
      await mongoose.connect(env.MONGO_URI);
      // eslint-disable-next-line no-console
      console.log('Connected to MongoDB');
    } else {
      // eslint-disable-next-line no-console
      console.warn('MONGO_URI not provided. API is running without database connection.');
    }

    app.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`StudentOS API listening on ${env.PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start API', error);
    process.exit(1);
  }
};

start();

const mongoose = require('mongoose');
const { MONGODB_URI } = require('./config');

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Could not connect to MongoDB', err));

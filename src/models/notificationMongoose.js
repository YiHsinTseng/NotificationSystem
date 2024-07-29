const mongoose = require('mongoose');
const { generateUserId } = require('../utils/generateId');

const notificationSchema = new mongoose.Schema({
  _id: {
    type: String, default: generateUserId, alias: 'user_id',
  },
  text: { type: String, required: true },
}, {
  toJSON: {
    transform(doc, ret) {
      const { _id, ...rest } = ret;
      const newRet = { user_id: _id, ...rest };
      return newRet;
    },
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Notification, notificationSchema };

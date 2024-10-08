const mongoose = require('mongoose');
const { generateNotificationId } = require('../utils/generateId');

const notificationSchema = new mongoose.Schema({
  _id: {
    type: String, default: generateNotificationId, alias: 'notification_id',
  },
  text: { type: String, required: true },
  sender: { type: String, required: true }, // 寄件者 （需要多加一個type嗎）
  type: { type: String },
  receiver: { type: String, required: true }, // 接收者
  createdAt: {
    type: Date,
    default: Date.now, // 默認為當前時間
  },
  link: {
    url: { type: String },
    data: {
      type: Map,
      default: {},
    },
    authToken: { type: String },
  },
  isRead: {
    type: Boolean,
    default: false, // 默認為未讀
  },
}, {
  toJSON: {
    transform(doc, ret) {
      const { _id, receiver, ...rest } = ret; // 機密內容
      const newRet = { notification_id: _id, ...rest };
      return newRet;
    },
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Notification, notificationSchema };

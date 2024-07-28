const mongoose = require('mongoose');
const { generateUserId } = require('../utils/generateId');
const { notificationSchema } = require('./notificationMongoose');
const AppError = require('../utils/appError');

const UserNotificationSchema = new mongoose.Schema({
  _id: {
    type: String, default: generateUserId, alias: 'user_id',
  },
  notifications: [notificationSchema],
}, {
  toJSON: {
    transform(doc, ret) {
      const { _id, ...rest } = ret;
      const newRet = { user_id: _id, ...rest };
      return newRet;
    },
  },
});

UserNotificationSchema.statics.findById = async function findById(user_id) {
  const userNotification = await this.findOne({ _id: user_id }).exec();
  // console.log(userNotification);
  if (!userNotification) {
    throw new AppError(404, 'User not found or invalid user ID');
  }
  return userNotification;
};

UserNotificationSchema.statics.getNotifications = async function getNotifications(user_id) {
  const userNotification = await this.findOne({ _id: user_id }).exec();
  if (!userNotification) {
    throw new AppError(404, 'No user group model in database');
  }
  const { notifications } = userNotification;
  if (notifications.length > 0) {
    return { success: true, message: 'Notifications got successfully', notifications };
  }
  return { success: false, message: 'No notifications found for the user' };
};

UserNotificationSchema.methods.createNotification = async function createNotification(user_id) {
  // Check if the userNotifications document already exists
  let userNotification = await this.model('UserNotification').findOne({ _id: user_id });

  // If not, create a new one
  if (!userNotification) {
    userNotification = new this.model('UserNotification')({ _id: user_id, notifications: [] });
  }

  // If the notifications field does not exist, initialize it
  if (!userNotification.notifications) {
    userNotification.notifications = [];
  }

  // Add the new group to the notifications array
  userNotification.notifications = userNotification.notifications.concat(this.notifications);

  // Save the updated UserNotification document
  await userNotification.save();

  return { success: true, message: 'Notification created successfully' };
};

const UserNotification = mongoose.model('UserNotification', UserNotificationSchema);

module.exports = UserNotification;

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
      const newRet = { _id, ...rest };
      return newRet;
    },
  },
});

UserNotificationSchema.statics.getAllUserIds = async function getAllUserIds() {
  try {
    // 查詢所有文檔，只返回 _id 欄位
    const userNotifications = await this.find({}, '_id').exec();

    // 提取 user_id (即 _id)
    const userIds = userNotifications.map((userNotification) => userNotification._id);

    return userIds;
  } catch (error) {
    console.error('獲取所有用戶 ID 時發生錯誤:', error.message || error);
    throw error; // 或根據需要處理錯誤
  }
};

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

UserNotificationSchema.statics.findNotificationById = async function (user_id, notification_id) {
  const userNotification = await this.findOne({ _id: user_id }).exec();
  if (!userNotification) {
    throw new AppError(404, 'User not found or invalid user ID');
  }
  const notification = userNotification.notifications.id(notification_id); // Correctly use .id()
  if (!notification) {
    throw new AppError(404, 'Notification not found or invalid notification ID');
  }
  return { userNotification, notification };
};

UserNotificationSchema.methods.patchNotification = async function (notification_id, isRead) {
  // Use this.model to call static method and get UserNotification instance
  const { userNotification, notification } = await this.model('UserNotification').findNotificationById(this._id, notification_id);

  if (!userNotification || !notification) {
    throw new AppError(404, 'User not found or invalid notification ID');
  }

  notification.isRead = isRead;

  // Save the updated UserNotification document
  await userNotification.save(); // Save the parent document

  return { success: true, message: 'Notification updated successfully' };
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

// 假設 this.storage 是 UserNotification 模型
UserNotificationSchema.methods.deleteOldNotifications = async function deleteOldNotifications(user_id, delDay) {
  // 找到指定用戶並刪除三天前的通知
  const userNotification = await this.model('UserNotification').findOne({ _id: user_id });

  if (userNotification) {
    userNotification.notifications = userNotification.notifications.filter((notification) => notification.createdAt >= delDay);

    // 保存更新後的文檔
    await userNotification.save();
  } else {
    console.error('User not found');
  }
};

const UserNotification = mongoose.model('UserNotification', UserNotificationSchema);

module.exports = UserNotification;

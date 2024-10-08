const { Notification } = require('../notificationMongoose.js');
const UserNotification = require('../userNotificationMongoose');

class MongoStorage {
  constructor() {
    this.UserNotification = UserNotification;
    this.Notification = Notification;
  }

  async getNotificationsCount(user_id) {
    try {
      const userNotification = await this.UserNotification.findById(user_id);
      // console.log(userNotification);
      if (!userNotification) {
        throw new Error('User notifications not found');
      }
      return userNotification.notifications.length;
    } catch (error) {
      console.error('Error getting notifications count:', error);
      throw error;
    }
  }

  async addNotification(user_id, notification) {
    try {
      const userNotification = await this.UserNotification.findById(user_id);
      if (!userNotification) {
        throw new Error('User notifications not found');
      }
      userNotification.notifications.push(notification);
      await userNotification.save();
      return { success: true, message: 'Notification added successfully' };
    } catch (error) {
      console.error('Error adding notification:', error);
      throw error;
    }
  }

  async getAllNotifications(user_id) {
    try {
      const userNotification = await this.UserNotification.findById(user_id);
      if (!userNotification) {
        throw new Error('User notifications not found');
      }
      return userNotification.notifications;
    } catch (error) {
      console.error('Error getting all notifications:', error);
      throw error;
    }
  }

  async patchNotification(user_id, notification_id, isRead) {
    try {
      // 獲取 UserNotification 實例
      const userNotification = await UserNotification.findById(user_id);
      if (!userNotification) {
        throw new Error('User not found');
      }

      // 調用實例方法
      const result = await userNotification.patchNotification(notification_id, isRead);
      return result;
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  }

  async deleteOldNotifications(user_id, delDay) {
    try {
      // 獲取 UserNotification 實例
      const userNotification = await UserNotification.findById(user_id);
      if (!userNotification) {
        throw new Error('User not found');
      }
      // 調用實例方法
      const result = await userNotification.deleteOldNotifications(user_id, delDay);
      return result;
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  }
}

module.exports = MongoStorage;

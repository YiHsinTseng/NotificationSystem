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
}

module.exports = MongoStorage;

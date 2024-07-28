const Notification = require('./notification');
const NotificationAync = require('./notificationMongoose').Notification;

class NotificationModel {
  constructor(storage) {
    this.storage = storage;
  }

  getNotificationsCount() {
    return this.storage.getNotificationsCount();
  }

  addNotification(message) {
    const id = Date.now();
    const notification = new NotificationAync({ id, text: message });
    this.storage.addNotification(notification);
  }

  getAllNotifications() {
    return this.storage.getAllNotifications();
  }
}

class NotificationAsyncModel {
  constructor(storage) {
    this.storage = storage;
  }

  async getNotificationsCount(user_id) {
    return await this.storage.getNotificationsCount(user_id);
  }

  async addNotification(user_id, message) {
    const id = Date.now();
    const notification = new Notification(id, message);
    await this.storage.addNotification(user_id, notification);
  }

  async getAllNotifications(user_id) {
    return await this.storage.getAllNotifications(user_id);
  }
}

module.exports = { NotificationModel, NotificationAsyncModel };

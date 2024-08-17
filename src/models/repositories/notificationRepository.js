const Notification = require('../notification.js');
const NotificationAync = require('../notificationMongoose.js').Notification;

class NotificationRepository {
  constructor(storage) {
    this.storage = storage;
  }

  getNotificationsCount() {
    return this.storage.getNotificationsCount();
  }

  addNotification(message, link, sender) {
    const id = Date.now();
    const notification = new NotificationAync({
      id, text: message, link, sender,
    });
    this.storage.addNotification(notification);
  }

  getAllNotifications() {
    return this.storage.getAllNotifications();
  }
}

class NotificationAsyncRepository {
  constructor(storage) {
    this.storage = storage;
  }

  async getNotificationsCount(user_id) {
    const count = await this.storage.getNotificationsCount(user_id);
    return count;
  }

  async addNotification(user_id, message, link, sender = 'system') {
    const id = Date.now(); // 也可用uuid
    const notification = new NotificationAync({
      id, text: message, receiver: user_id, sender, link,
    });
    await this.storage.addNotification(user_id, notification);
  }

  async getAllNotifications(user_id) {
    const notifications = await this.storage.getAllNotifications(user_id);
    return notifications;
  }

  async patchNotification(user_id, notification_id, isRead) {
    await this.storage.patchNotification(user_id, notification_id, isRead);
  }
}

module.exports = { NotificationRepository, NotificationAsyncRepository };

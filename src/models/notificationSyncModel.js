const Notification = require('./notification');

class NotificationModel {
  constructor(storage) {
    this.storage = storage;
  }

  getNotificationsCount() {
    return this.storage.getNotificationsCount();
  }

  addNotification(message) {
    const id = Date.now();
    const notification = new Notification(id, message);
    this.storage.addNotification(notification);
  }

  getAllNotifications() {
    return this.storage.getAllNotifications();
  }
}

module.exports = NotificationModel;

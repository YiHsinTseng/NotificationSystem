// memoryStorage.js
const StorageInterface = require('./storageInterface');

class MemoryStorage extends StorageInterface {
  constructor() {
    super();
    this.notifications = new Map();// 沒有往上加上user層
    this.notificationsCount = 0;
  }

  getNotificationsCount() {
    // console.log(this.notificationsCount);
    return this.notificationsCount;
  }

  addNotification(notification) {
    this.notifications.set(notification.id, notification);
    this.notificationsCount++;
    // console.log(notification);
  }

  getAllNotifications() {
    console.log(Array.from(this.notifications.values()).map((note) => note.toJSON()));
    return Array.from(this.notifications.values()).map((note) => note.toJSON());
  }
}

module.exports = MemoryStorage;

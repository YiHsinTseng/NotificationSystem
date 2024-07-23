class NotificationModel {
  constructor() {
    this.notifications = 0;
  }

  // Get the current notification count
  getNotifications() {
    return this.notifications;
  }

  // Increment the notification count
  incrementNotifications() {
    this.notifications += 1;
  }

  // Set the notification count to a specific value
  setNotifications(count) {
    this.notifications = count;
  }
}

module.exports = NotificationModel;

class Notification {
  constructor(id, text) {
    this.id = id; // 唯一標識符
    this.text = text; // 文字內容
    this.timestamp = new Date(); // 消息生成時間
  }

  toJSON() {
    return {
      id: this.id,
      text: this.text,
      timestamp: this.timestamp.toISOString(), // 將時間轉換為 ISO 格式字符串
    };
  }
}

class NotificationModel {
  constructor() {
    // this.notifications = 0;
    this.notifications = new Map();
    this.notificationsCount = 0;
  }

  // Get the current notification count
  getNotificationsCount() {
    // return this.notifications;
    return this.notificationsCount;
  }

  // Increment the notification count
  addNotification(message) {
    // this.notifications += 1;
    const id = Date.now();
    const note = new Notification(id, message);
    this.count += 1;
    this.notifications.set(id, note);
    this.notificationsCount++; // 更新計數器
    console.log(this.notifications);
  }

  // Get detailed notification info
  getAllNotifications() {
    // Implement this if needed
    // return []; // Example placeholder

    const result = Array.from(this.notifications.values()).map((note) => note.toJSON());

    return result;
  }
}

module.exports = NotificationModel;

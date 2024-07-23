// model.js
class NotificationModel {
  constructor() {
    this.notifications = 0; // 初始通知數量
  }

  // 獲取通知數量
  getNotifications() {
    return this.notifications;
  }

  // 更新通知數量
  setNotifications(count) {
    this.notifications = count;
  }
}

// 輸出通知模型
export default NotificationModel;

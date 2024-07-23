// 引入通知模型
import NotificationModel from '../models/notif';

// 創建通知模型實例
const notificationModel = new NotificationModel();

// 獲取通知數量的 DOM 元素
const notificationCountElement = document.getElementById('notification-count');

// 更新視圖函數
function updateView() {
  const count = notificationModel.getNotifications();
  notificationCountElement.textContent = count;
}

// 模擬通知數量更新
setTimeout(() => {
  notificationModel.setNotifications(5); // 更新通知數量為 5
  updateView(); // 更新視圖
}, 1000);

// const model = require('../services/notif');

const getNotificationsCount = async (notificationRepository, user_id) => {
  try {
    return {
      count: await notificationRepository.getNotificationsCount(user_id),
    };
  } catch (error) {
    console.error('獲取通知時發生錯誤:', error.message || error);
    throw new Error('業務邏輯處理錯誤');
  }
};

const getNotifications = async (notificationRepository, user_id) => {
  try {
    const notifications = {
      count: await notificationRepository.getNotificationsCount(user_id),
      details: await notificationRepository.getAllNotifications(user_id), // Ensure this method exists
    };
    // console.log(notifications);
    // console.log(1);
    return notifications;
  } catch (error) {
    console.error('獲取通知時發生錯誤:', error.message || error);
    throw new Error('業務邏輯處理錯誤');
  }
};

const addNotifications = async (notificationRepository, user_id, message) => {
  try {
    // If incrementNotifications involves async operations, await it
    await notificationRepository.addNotification(user_id, message);
    // 如果要合併的話會在此 回傳最新的notifications (getNotifications)
  } catch (error) {
    console.error('增加通知時發生錯誤:', error.message || error);
  }
};

module.exports = {
  getNotificationsCount,
  addNotifications,
  getNotifications,
};

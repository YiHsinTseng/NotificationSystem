// const model = require('../services/notif');

const getNotificationsCount = (notificationRepository) => {
  try {
    return {
      count: notificationRepository.getNotificationsCount(),
    };
  } catch (error) {
    console.error('獲取通知時發生錯誤:', error.message || error);
    throw new Error('業務邏輯處理錯誤');
  }
};

const getNotifications = (notificationRepository) => {
  try {
    return {
      count: notificationRepository.getNotificationsCount(),
      details: notificationRepository.getAllNotifications(), // Ensure this method exists
    };
  } catch (error) {
    console.error('獲取通知時發生錯誤:', error.message || error);
    throw new Error('業務邏輯處理錯誤');
  }
};

const addNotifications = (notificationRepository, message) => {
  try {
    // If incrementNotifications involves async operations, await it
    notificationRepository.addNotification(message);
  } catch (error) {
    console.error('增加通知時發生錯誤:', error.message || error);
  }
};

module.exports = {
  getNotificationsCount,
  addNotifications,
  getNotifications,
};

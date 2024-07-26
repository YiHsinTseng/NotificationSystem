// const model = require('../services/notif');

const getNotificationsCount = async (notificationModel) => {
  try {
    return {
      count: await notificationModel.getNotificationsCount(),
    };
  } catch (error) {
    console.error('獲取通知時發生錯誤:', error.message || error);
    throw new Error('業務邏輯處理錯誤');
  }
};

const getNotifications = async (notificationModel) => {
  try {
    return {
      count: await notificationModel.getNotificationsCount(),
      details: await notificationModel.getAllNotifications(), // Ensure this method exists
    };
  } catch (error) {
    console.error('獲取通知時發生錯誤:', error.message || error);
    throw new Error('業務邏輯處理錯誤');
  }
};

const addNotifications = async (notificationModel, message) => {
  try {
    // If incrementNotifications involves async operations, await it
    await notificationModel.addNotification(message);
  } catch (error) {
    console.error('增加通知時發生錯誤:', error.message || error);
  }
};

module.exports = {
  getNotificationsCount,
  addNotifications,
  getNotifications,
};

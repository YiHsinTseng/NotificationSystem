// const model = require('../services/notif');

const getNotificationsCount = async (notificationModel, user_id) => {
  try {
    return {
      count: await notificationModel.getNotificationsCount(user_id),
    };
  } catch (error) {
    console.error('獲取通知時發生錯誤:', error.message || error);
    throw new Error('業務邏輯處理錯誤');
  }
};

const getNotifications = async (notificationModel, user_id) => {
  try {
    const notifications = {
      count: await notificationModel.getNotificationsCount(user_id),
      details: await notificationModel.getAllNotifications(user_id), // Ensure this method exists
    };
    // console.log(notifications);
    // console.log(1);
    return notifications;
  } catch (error) {
    console.error('獲取通知時發生錯誤:', error.message || error);
    throw new Error('業務邏輯處理錯誤');
  }
};

const addNotifications = async (notificationModel, user_id, message) => {
  try {
    // If incrementNotifications involves async operations, await it
    await notificationModel.addNotification(user_id, message);
  } catch (error) {
    console.error('增加通知時發生錯誤:', error.message || error);
  }
};

module.exports = {
  getNotificationsCount,
  addNotifications,
  getNotifications,
};

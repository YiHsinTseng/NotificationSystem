// const model = require('../services/notif');
const User = require('../models/user');

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

const addNotifications = async (notificationRepository, user_id, message, link, sender, type) => {
  try {
    // If incrementNotifications involves async operations, await it
    await notificationRepository.addNotification(user_id, message, link, sender, type);
    // 如果要合併的話會在此 回傳最新的notifications (getNotifications)
  } catch (error) {
    console.error('增加通知時發生錯誤:', error.message || error);
  }
};

const addjobNotifications = async (notificationRepository, notif, sender, type) => {
  try {
    // 需要驗證user_id是否存在
    // const { user_id } = notif;
    // console.log(notif);
    const public_id = notif.user_id;
    const { authToken } = notif;
    // const foundUser = await User.findUserById(user_id);
    const user = await User.findUserByPublicId(public_id);
    const user_id = user._id;
    // console.log(user_id);
    if (user_id) {
      const message = `有 ${notif.data.update} 筆更新，共有 ${notif.data.count} 筆工作資料符合結果`;
      const link = { url: 'http://localhost:4000/api/filterJobsBySub', data: notif.data, authToken };
      await addNotifications(notificationRepository, user_id, message, link, sender, type);
      console.log('success');
      console.log(message);
      return user_id;
    }
  } catch (error) {
    // 處理異常
    // console.error('An error occurred:', error);
    // console.log('false');
    // return;
  }
};

const addfastNotifications = async (notificationRepository, notif, sender, type) => {
  // const { user_id } = notif;
  try {
    const public_id = notif.user_id;
    // console.log(public_id);
    // 需要驗證user_id是否存在
    // console.log(notif);

    // const foundUser = await User.findUserById(user_id);
    const user = await User.findUserByPublicId(public_id);
    const user_id = user._id;
    const sub_item = notif.data.company_name || notif.data.job_title;
    if (user_id) {
      const message = `${sub_item} 職缺已有更新`;
      const link = { url: null, data: notif.data };
      await addNotifications(notificationRepository, user_id, message, link, sender, type);
      console.log('success');
      // console.log(message);
      return user_id;
    }
  } catch (error) {
    // 處理異常
    // console.error('An error occurred:', error);
    // console.log('false');
    // return;
  }
};

const patchNotification = async (notificationRepository, user_id, notification_id, isRead) => {
  try {
    await notificationRepository.patchNotification(user_id, notification_id, isRead);
  } catch (error) {
    console.error('獲取通知時發生錯誤:', error.message || error);
    throw new Error('業務邏輯處理錯誤');
  }
};
module.exports = {
  getNotificationsCount,
  addNotifications,
  addjobNotifications,
  addfastNotifications,
  getNotifications,
  patchNotification,
};

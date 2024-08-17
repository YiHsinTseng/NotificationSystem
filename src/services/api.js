const { addNotifications } = require('./notifAsync');
const User = require('../models/user');

const addjobNotifications = async (notificationRepository, notif, sender) => {
  const user_id = notif.customer_id;
  // 需要驗證user_id是否存在
  // console.log(notif);
  try {
    const foundUser = await User.findUserById(user_id);
    // 可能會引發異常的代碼
    if (foundUser) {
      const message = `有 ${notif.data.update} 筆更新，共有 ${notif.data.count} 筆工作資料符合結果`;
      const link = { url: 'http://localhost:4000/api/filterJobsBySub', data: notif.data };
      await addNotifications(notificationRepository, user_id, message, link, sender);
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

const addfastNotifications = async (notificationRepository, notif, sender) => {
  const user_id = notif.customer_id;
  // 需要驗證user_id是否存在
  // console.log(notif);
  try {
    const foundUser = await User.findUserById(user_id);
    const sub_item = notif.data.company_name || notif.data.job_title;
    // 可能會引發異常的代碼
    if (foundUser) {
      const message = `${sub_item} 職缺已有更新`;
      const link = { url: null, data: notif.data };
      await addNotifications(notificationRepository, user_id, message, link, sender);
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

module.exports = { addjobNotifications, addfastNotifications };

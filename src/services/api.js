const { addNotifications } = require('./notifAsync');
const User = require('../models/user');

const addjobNotifications = async (notificationRepository, notif) => {
  const user_id = notif.customer_id;
  // 需要驗證user_id是否存在
  // console.log(notif);
  try {
    const foundUser = await User.findUserById(user_id);
    // 可能會引發異常的代碼
    if (foundUser) {
      const message = `有 ${notif.update} 筆更新，共有 ${notif.count} 筆工作資料符合結果`;
      const link = { url: 'http://localhost:4000/api/filterJobsBySub', data: notif };
      await addNotifications(notificationRepository, user_id, message, link);
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

module.exports = { addjobNotifications };

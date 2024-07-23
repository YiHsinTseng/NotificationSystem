// const NotificationModel = require('../models/notif');

const incrementNotification = (req, res) => {
  try {
    const notificationModel = req.app.get('notificationModel');
    const io = req.app.get('io');

    notificationModel.incrementNotifications();
    io.emit('notificationUpdate', { count: notificationModel.getNotifications() });

    res.json({ count: notificationModel.getNotifications() });
  } catch (error) {
    console.error('處理 POST 請求時發生錯誤:', error);
    res.status(500).send('內部服務器錯誤');
  }
};

module.exports = {
  incrementNotification,
};

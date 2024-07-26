const notifSerivce = require('../services/notifAsync');

const getNotification = async (req, res) => {
  try {
    const notificationModel = req.app.get('notificationModel');
    // const io = req.app.get('io');

    const notifications = await notifSerivce.getNotifications(notificationModel);
    // io.emit('notificationUpdate', notifications);

    res.status(200).json({ message: 'Notification updated successfully', notifications });
  } catch (error) {
    console.error('處理 POST 請求時發生錯誤:', error.message || error);
    res.status(500).send('內部服務器錯誤');
  }
};
const addNotification = async (req, res) => {
  try {
    const notificationModel = req.app.get('notificationModel');
    const io = req.app.get('io');

    const { message } = req.body;

    await notifSerivce.addNotifications(notificationModel, message); // Assume this is async
    const notifications = await notifSerivce.getNotifications(notificationModel);
    io.emit('notificationUpdate', notifications); // 只要推送{count} 要確保資料格式很熟

    // io.emit('notificationUpdate', { count: notifications.count }); // 只要推送{count} 要確保資料格式很熟
    console.log('Notifications count to be emitted:', notifications.count);

    res.status(200).send('Notification updated successfully');
  } catch (error) {
    console.error('處理 POST 請求時發生錯誤:', error.message || error);
    res.status(500).send('內部服務器錯誤');
  }
};

// sub notif
// 提供自己的id以及訂閱條件給訂閱服務器，讓服務器透過爬取的資料推播回主通知系統

// pub notif
// 提供自己的id以及訂閱條件給訂閱服務器，讓服務器透過爬取的資料推播回主通知系統

module.exports = {
  getNotification,
  addNotification,
};

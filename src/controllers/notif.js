// const notifSerivce = require('../services/notifAsync');
const notifSerivce = require('../services/notifAsync');

const getNotification = async (req, res) => {
  try {
    const notificationRepository = req.app.get('notificationRepository');
    // const io = req.app.get('io');
    const { user_id } = req.user;

    const notifications = await notifSerivce.getNotifications(notificationRepository, user_id);
    // io.emit('notificationUpdate', notifications);

    res.status(200).json({ message: 'Notification updated successfully', notifications });
  } catch (error) {
    console.error('處理 POST 請求時發生錯誤:', error.message || error);
    res.status(500).send('內部服務器錯誤');
  }
};
const addNotification = async (req, res) => {
  try {
    const notificationRepository = req.app.get('notificationRepository');
    const io = req.app.get('io');

    const { user_id } = req.body;
    const { message } = req.body;
    // console.log(user_id);

    await notifSerivce.addNotifications(notificationRepository, user_id, message); // Assume this is async
    const notifications = await notifSerivce.getNotifications(notificationRepository, user_id);
    io.emit('notificationUpdate', notifications); // 只要推送{count} 要確保資料格式很熟

    // io.emit('notificationUpdate', { count: notifications.count }); // 只要推送{count} 要確保資料格式很熟
    console.log('Notifications count to be emitted:', notifications.count);

    res.status(200).send('Notification updated successfully');
  } catch (error) {
    console.error('處理 POST 請求時發生錯誤:', error.message || error);
    res.status(500).send('內部服務器錯誤');
  }
};

const patchNotification = async (req, res) => {
  try {
    const notificationRepository = req.app.get('notificationRepository');
    // const io = req.app.get('io');
    const { user_id } = req.user;
    const { notification_id } = req.params;
    const { isRead } = req.body;
    await notifSerivce.patchNotification(notificationRepository, user_id, notification_id, isRead);

    // const notifications = await notifSerivce.getNotifications(notificationRepository, user_id);
    // io.emit('notificationUpdate', notifications); // 只要推送{count} 要確保資料格式很熟

    res.status(200).json({ message: 'Notification Readed successfully' });
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
  patchNotification,
};
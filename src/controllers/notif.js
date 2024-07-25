const notifSerivce = require('../services/notif');

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
    const notifications = notifSerivce.getNotifications(notificationModel);
    io.emit('notificationUpdate', notifications);

    res.status(200).send('Notification updated successfully');
  } catch (error) {
    console.error('處理 POST 請求時發生錯誤:', error.message || error);
    res.status(500).send('內部服務器錯誤');
  }
};

module.exports = {
  getNotification,
  addNotification,
};

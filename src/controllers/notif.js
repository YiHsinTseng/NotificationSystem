const notif = require('../services/notif');

const incrementNotification = async (req, res) => {
  try {
    const notificationModel = req.app.get('notificationModel');
    const io = req.app.get('io');

    await notif.incrementNotifications(notificationModel); // Assume this is async
    const notifications = notif.getNotifications(notificationModel);
    io.emit('notificationUpdate', notifications);

    res.status(200).send('Notification updated successfully');
  } catch (error) {
    console.error('处理 POST 请求时发生错误:', error.message || error);
    res.status(500).send('内部服务器错误');
  }
};

module.exports = {
  incrementNotification,
};

const getNotifications = (notificationModel) => {
  try {
    return {
      count: notificationModel.getNotifications(),
      details: notificationModel.getAllNotifications(), // Ensure this method exists
    };
  } catch (error) {
    console.error('获取通知时发生错误:', error.message || error);
    throw new Error('业务逻辑处理错误');
  }
};

const incrementNotifications = async (notificationModel) => {
  try {
    // If incrementNotifications involves async operations, await it
    await notificationModel.incrementNotifications();
  } catch (error) {
    console.error('增加通知时发生错误:', error.message || error);
    throw new Error('业务逻辑处理错误');
  }
};

module.exports = {
  incrementNotifications,
  getNotifications,
};

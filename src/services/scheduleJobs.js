const cron = require('node-cron');
const notifSerivce = require('./notifAsync');
const UserNotification = require('../models/userNotificationMongoose');

const deleteAllUserOldNotifications = async (notificationRepository) => {
  try {
    const userIds = await UserNotification.getAllUserIds();
    // console.log('所有用戶 ID:', userIds);

    const daysAgo = 3;
    for (const user_id of userIds) {
      await notifSerivce.deleteOldNotifications(notificationRepository, user_id, daysAgo);
    }
    console.log(`所有使用者${daysAgo}天前過期通知已刪除`);
  } catch (error) {
    console.error('刪除過期通知時發生錯誤:', error.message || error);
  }
};

const scheduleJobs = (notificationRepository, CRON_SCHEDULE) => {
  const cronRegex = /^(\d{1,2}|\*) (\d{1,2}|\*) (\d{1,2}|\*) (\d{1,2}|\*) (\d{1,2}|\*)$/;

  if (!cronRegex.test(CRON_SCHEDULE)) {
    console.warn(`CRON_SCHEDULE 格式不正確: ${CRON_SCHEDULE}，使用預設值 "0 4 * * *"`);
    CRON_SCHEDULE = '0 4 * * *';
  }
  cron.schedule(CRON_SCHEDULE, async () => {
    await deleteAllUserOldNotifications(notificationRepository);
  });
};

module.exports = { scheduleJobs };

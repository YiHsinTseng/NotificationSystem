const socketIo = require('socket.io');

const { authenticateJwtSocket } = require('../middlewares/authenticate');

// Create an instance of NotificationRepository and set it in the app
// const memoryStorage = new MemoryStorage();
// const notificationRepository = new NotificationRepository(memoryStorage);

const setupSocketIo = (server, notifService, notificationRepository) => {
  const io = socketIo(server);
  io.use(authenticateJwtSocket);
  // 同步儲存庫
  // io.on('connection', (socket) => {
  //   console.log('A new client connected');
  //   // socket.emit('notificationUpdate', { count: notificationRepository.getNotificationsCount() });
  //   socket.emit('notificationUpdate', notifService.getNotificationsCount(notificationRepository));
  //   console.log(notifService.getNotificationsCount(notificationRepository));
  //   socket.on('disconnect', () => {
  //     console.log('Client disconnected');
  //   });
  // });
  // const userConnections = new Map();
  io.on('connection', async (socket) => {
    console.log('A new client connected');
    try {
      const user_id = socket.user; // 確保正確提取用戶 ID
      // userConnections.set(user_id, socket); // 存到全局
      // console.log(user_id);
      const notification = await notifService.getNotifications(notificationRepository, user_id);
      socket.emit('notificationUpdate', notification.count);
      // console.log(notification.count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
  return io;
};

module.exports = setupSocketIo;

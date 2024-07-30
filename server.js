const path = require('path');
const express = require('express');

const http = require('http');
const socketIo = require('socket.io');

require('./config/dbConnect');

const userRoute = require('./src/routes/user');
const notifRoute = require('./src/routes/notif');

// 為了自由切換儲存資料庫實作
// const { NotificationRepository } = require('./src/repositories/notificationRepository'); // Import NotificationRepository
// const notifService = require('./src/services/notifSync'); // Import NotificationRepository
// const MemoryStorage = require('./src/models/storages/memoryStorage');

const notifService = require('./src/services/notifAsync'); // Import NotificationRepository
const { NotificationAsyncRepository } = require('./src/models/repositories/notificationRepository');
const MongodbStorage = require('./src/models/storages/mongodbStorage');

const app = express();
const port = 3000;

const server = http.createServer(app);
const io = socketIo(server);
app.set('io', io);

const apiErrorHandler = require('./src/middlewares/apiErrorHandler');

// Create an instance of NotificationRepository and set it in the app
// const memoryStorage = new MemoryStorage();
// const notificationRepository = new NotificationRepository(memoryStorage);

const mongodbStorage = new MongodbStorage();
const notificationRepository = new NotificationAsyncRepository(mongodbStorage);

app.set('notificationRepository', notificationRepository);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'src/views')));// 公開瀏覽不受jwt驗證影響，index重導向login

app.use('/', userRoute);
app.use('/notifications', notifRoute);

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

const { authenticateJwtSocket } = require('./src/middlewares/authenticate');

io.use(authenticateJwtSocket);
io.on('connection', async (socket) => {
  console.log('A new client connected');

  try {
    const user_id = socket.user; // 確保正確提取用戶 ID
    // console.log(user_id);
    const notification = await notifService.getNotifications(notificationRepository, user_id);
    socket.emit('notificationUpdate', notification);
    console.log(notification.count);
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// general error handler
// app.use(apiErrorHandler);

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

const express = require('express');
const path = require('path');

const http = require('http');
const socketIo = require('socket.io');

require('./config/dbConnect');

const userRoute = require('./src/routes/user');
const notifRoute = require('./src/routes/notif');

// 為了自由切換儲存資料庫實作
// const { NotificationModel } = require('./src/models/notificationModel'); // Import NotificationModel
// const notifService = require('./src/services/notifSync'); // Import NotificationModel
// const MemoryStorage = require('./src/repositories/memoryStorage');

const notifService = require('./src/services/notifAsync'); // Import NotificationModel
const { NotificationAsyncModel } = require('./src/models/notificationModel');
const MongodbStorage = require('./src/repositories/mongodbStorage');

const app = express();
const port = 3000;

const server = http.createServer(app);
const io = socketIo(server);
app.set('io', io);

const apiErrorHandler = require('./src/middlewares/apiErrorHandler');
// Create an instance of NotificationModel and set it in the app

// const memoryStorage = new MemoryStorage();
// const notificationModel = new NotificationModel(memoryStorage);

const mongodbStorage = new MongodbStorage();
const notificationModel = new NotificationAsyncModel(mongodbStorage);
app.set('notificationModel', notificationModel);

app.use(express.json());

app.use(express.static(path.join(__dirname, 'src/views')));// 公開瀏覽不受jwt驗證影響，index重導向login

app.use('/', userRoute);
app.use('/notifications', notifRoute);

// io.on('connection', (socket) => {
//   console.log('A new client connected');
//   // socket.emit('notificationUpdate', { count: notificationModel.getNotificationsCount() });
//   socket.emit('notificationUpdate', notifService.getNotificationsCount(notificationModel));
//   console.log(notifService.getNotificationsCount(notificationModel));
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
    const notification = await notifService.getNotifications(notificationModel, user_id);
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

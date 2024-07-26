const express = require('express');
const path = require('path');

const http = require('http');
const socketIo = require('socket.io');

require('./config/dbConnect');

const notifRoute = require('./src/routes/notif');
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

// Create an instance of NotificationModel and set it in the app

// const memoryStorage = new MemoryStorage();
// const notificationModel = new NotificationModel(memoryStorage);

const mongodbStorage = new MongodbStorage();
const notificationModel = new NotificationAsyncModel(mongodbStorage);
app.set('notificationModel', notificationModel);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'src')));
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

io.on('connection', async (socket) => {
  console.log('A new client connected');
  // socket.emit('notificationUpdate', { count: notificationModel.getNotificationsCount() });

  // const count = await notifService.getNotificationsCount(notificationModel);
  const notification = await notifService.getNotifications(notificationModel);

  socket.emit('notificationUpdate', notification);
  console.log(notification.count);
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.use((req, res) => {
  res.status(404).send('Page not found');
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

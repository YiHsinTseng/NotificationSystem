const express = require('express');
const path = require('path');

const http = require('http');
const socketIo = require('socket.io');

const notifRoute = require('./src/routes/notif');
const NotificationModel = require('./src/models/notif'); // Import NotificationModel

const app = express();
const port = 3000;

const server = http.createServer(app);
const io = socketIo(server);
app.set('io', io);

// Create an instance of NotificationModel and set it in the app
const notificationModel = new NotificationModel();
app.set('notificationModel', notificationModel);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'src')));
app.use('/notifications', notifRoute);

io.on('connection', (socket) => {
  console.log('A new client connected');
  socket.emit('notificationUpdate', { count: notificationModel.getNotifications() });
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

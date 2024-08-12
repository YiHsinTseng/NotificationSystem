require('dotenv').config(); // 引入並加載 .env 文件
const path = require('path');
const express = require('express');

const http = require('http');
const socketIo = require('socket.io');

const mqtt = require('mqtt');

// MQTT 伺服器配置
// const MQTT_BROKER_URL = 'mqtt://localhost';
const { MQTT_BROKER_URL } = process.env;
const MQTT_TOPIC = 'notifications';
const mqttClient = mqtt.connect(MQTT_BROKER_URL, {
  clientId: 'test', // 為 MQTT 客戶端指定 clientId
  clean: false, // 允許持久化會話
  connectTimeout: 30000, // 設置連接超時時間
  reconnectPeriod: 10000, // 設置重連間隔為 10 秒
});

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

const { addjobNotifications } = require('./src/services/api');

const app = express();
const port = 5050;

const server = http.createServer(app);
const io = socketIo(server);
app.set('io', io);

// const apiErrorHandler = require('./src/middlewares/apiErrorHandler');

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

// 設置消息的 QoS 等級
const QOS_LEVEL = 1; // 設置為 1 或 2

// 訂閱主題
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker.');
  mqttClient.subscribe(MQTT_TOPIC, { qos: QOS_LEVEL }, (err) => {
    if (err) {
      console.error('Subscription error:', err);
    } else {
      console.log(`Subscribed to topic '${MQTT_TOPIC}'`);
    }
  });
});

// 處理接收到的消息
mqttClient.on('message', async (topic, message) => {
  if (topic === MQTT_TOPIC) {
    // console.log(`Received message on topic '${MQTT_TOPIC}':`, message.toString());
    const messageObject = JSON.parse(message.toString());
    const user_id = await addjobNotifications(notificationRepository, messageObject);
    if (user_id) {
      const notification = await notifService.getNotifications(notificationRepository, user_id);
      io.emit('notificationUpdate', notification);
      console.log(notification.count);
    }
  }
});

// const userConnections = new Map();

const { authenticateJwtSocket } = require('./src/middlewares/authenticate');

io.use(authenticateJwtSocket);
io.on('connection', async (socket) => {
  console.log('A new client connected');
  try {
    const user_id = socket.user; // 確保正確提取用戶 ID
    // userConnections.set(user_id, socket); // 存到全局
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

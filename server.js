require('dotenv').config(); // 引入並加載 .env 文件
require('./config/dbConnect');

const http = require('http');
const path = require('path');
const createExpressApp = require('./config/expressConfig');
const setupRoutes = require('./src/routes/index');
const apiErrorHandler = require('./src/middlewares/apiErrorHandler');

// 為了自由切換儲存資料庫實作
// const notifService = require('./src/services/notifSync');
const notifService = require('./src/services/notifAsync');
const initializeServices = require('./src/initializers/initializeServices');

const setupMqttClient = require('./src/initializers/mqttClient');
const setupSocketIo = require('./src/initializers/socketIo');

const app = createExpressApp();
const server = http.createServer(app);
const port = process.env.PORT;// 5050;

const { notificationRepository } = initializeServices();

// 加入週期性任務
const { scheduleJobs } = require('./src/services/scheduleJobs');

const { CRON_SCHEDULE } = process.env;
scheduleJobs(notificationRepository, CRON_SCHEDULE);

const io = setupSocketIo(server, notifService, notificationRepository);
setupMqttClient(notifService, notificationRepository, io);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './src/views', 'index.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, './src/views', 'login.html'));
});

app.set('notificationRepository', notificationRepository);
app.set('io', io);
setupRoutes(app);
app.use(apiErrorHandler);

server.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});

const mqtt = require('mqtt');
const { addjobNotifications, addfastNotifications } = require('../services/notifAsync');

const setupMqttClient = (notifService, notificationRepository, io) => {
// MQTT 伺服器配置
// const MQTT_BROKER_URL = 'mqtt://localhost';
  const { MQTT_BROKER_URL } = process.env;
  const MQTT_TOPIC = 'notifications';
  const MQTT_JOB = 'job_id_channel';
  const MQTT_COMPANY = 'company_name_channel';

  const mqttClient = mqtt.connect(MQTT_BROKER_URL, {
    clientId: 'test', // 為 MQTT 客戶端指定 clientId
    clean: false, // 允許持久化會話
    connectTimeout: 30000, // 設置連接超時時間
    reconnectPeriod: 10000, // 設置重連間隔為 10 秒
  });

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
    mqttClient.subscribe(MQTT_JOB, { qos: QOS_LEVEL }, (err) => {
      if (err) {
        console.error('Subscription error:', err);
      } else {
        console.log(`Subscribed to topic '${MQTT_JOB}'`);
      }
    });
    mqttClient.subscribe(MQTT_COMPANY, { qos: QOS_LEVEL }, (err) => {
      if (err) {
        console.error('Subscription error:', err);
      } else {
        console.log(`Subscribed to topic '${MQTT_COMPANY}'`);
      }
    });
  });

  // 處理接收到的消息，就生成簡單消息並更新通知數量
  mqttClient.on('message', async (topic, message) => {
    if (topic === MQTT_TOPIC) {
      // console.log(`Received message on topic '${MQTT_TOPIC}':`, message.toString());
      const messageObject = JSON.parse(message.toString());
      const sender = 'Job_Pub';
      const type = 'routine';
      const user_id = await addjobNotifications(notificationRepository, messageObject, sender, type);
      if (user_id) {
        const notification = await notifService.getNotifications(notificationRepository, user_id);
        io.emit('notificationUpdate', notification);
        console.log(notification.count);
      }
    }
    if (topic === MQTT_JOB) {
      // console.log(`Received message on topic '${MQTT_JOB}':`, message.toString());
      const messageObject = JSON.parse(message.toString());
      const sender = 'Job_Pub';// plugin_name?
      const type = MQTT_JOB;// api種類
      const user_id = await addfastNotifications(notificationRepository, messageObject, sender, type);
      if (user_id) {
        const notification = await notifService.getNotifications(notificationRepository, user_id);
        io.emit('notificationUpdate', notification);
        console.log(notification.count);
      }
    }
    if (topic === MQTT_COMPANY) {
      // console.log(`Received message on topic '${MQTT_COMPANY}':`, message.toString());
      const messageObject = JSON.parse(message.toString());
      const sender = 'Job_Pub';
      const type = MQTT_COMPANY;
      const user_id = await addfastNotifications(notificationRepository, messageObject, sender, type);
      if (user_id) {
        const notification = await notifService.getNotifications(notificationRepository, user_id);
        io.emit('notificationUpdate', notification);
        console.log(notification.count);
      }
    }
  });
};

module.exports = setupMqttClient;

const express = require('express');
const path = require('path');
const notifRoute = require('./src/routes/notif');

const app = express();
const port = 3000;

// 用於解析 JSON 請求體（如果需要）
app.use(express.json());

// 提供靜態文件
app.use(express.static(path.join(__dirname, 'src')));

// 使用通知路由
app.use('/notifications', notifRoute);

// 處理 404 錯誤
app.use((req, res) => {
  res.status(404).send('頁面未找到');
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`伺服器正在 http://localhost:${port} 運行`);
});

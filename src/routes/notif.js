// routes/notifications.js
const express = require('express');

const router = express.Router();

// 創建通知模型
let notificationCount = 0;

// 處理通知數量的請求
router.get('/', (req, res) => {
  try {
    res.json({ count: notificationCount });
  } catch (error) {
    console.error('處理 GET 請求時發生錯誤:', error);
    res.status(500).send('內部伺服器錯誤');
  }
});

// 增加通知數量的請求
router.post('/increment', (req, res) => {
  try {
    notificationCount++;
    res.json({ count: notificationCount });
  } catch (error) {
    console.error('處理 POST 請求時發生錯誤:', error);
    res.status(500).send('內部伺服器錯誤');
  }
});

module.exports = router;

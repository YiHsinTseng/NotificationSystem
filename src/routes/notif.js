const express = require('express');

const router = express.Router();

router.post('/increment', (req, res) => {
  try {
    const notificationModel = req.app.get('notificationModel');
    const io = req.app.get('io');

    notificationModel.incrementNotifications();
    io.emit('notificationUpdate', { count: notificationModel.getNotifications() });

    res.json({ count: notificationModel.getNotifications() });
  } catch (error) {
    console.error('Error processing POST request:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;

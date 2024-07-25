const express = require('express');

const router = express.Router();

const controller = require('../controllers/notif');

router.get('/', controller.getNotification);
router.post('/', controller.addNotification);

module.exports = router;

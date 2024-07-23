const express = require('express');

const router = express.Router();

const { incrementNotification } = require('../controllers/notif');

router.post('/increment', incrementNotification);

module.exports = router;

const express = require('express');

const router = express.Router();

const controller = require('../controllers/notif');
const { authenticateAdmin } = require('../middlewares/authenticate');

router.get('/', controller.getNotification);
router.post('/', authenticateAdmin, controller.addNotification);

module.exports = router;

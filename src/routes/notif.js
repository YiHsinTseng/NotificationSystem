const express = require('express');

const router = express.Router();

const controller = require('../controllers/notif');
const { authenticateAdmin } = require('../middlewares/authenticate');

router.get('/', controller.getNotification);
router.post('/', authenticateAdmin, controller.addNotification);
router.patch('/:notification_id', controller.patchNotification);
router.delete('/', controller.cleanUpOldNotifications);

module.exports = router;

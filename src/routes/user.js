const router = require('express').Router();
const controller = require('../controllers/user');
const { authenticateJwt, authenticateAdmin } = require('../middlewares/authenticate');

// local auth
router.post('/users/register', controller.register);
router.post('/users/login', controller.login);

// JWT authentication middleware
router.use(authenticateJwt);

router.get('/users', authenticateAdmin, controller.getAllUsers);
router.get('/user', controller.getUserInfo);
router.patch('/user', controller.updateUserInfo);
router.delete('/user', controller.deleteUser);

module.exports = router;

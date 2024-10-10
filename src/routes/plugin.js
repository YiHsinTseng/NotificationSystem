const express = require('express');

const router = express.Router();

const controller = require('../controllers/plugin');
const pluginProxyController = require('../controllers/pluginProxy');
const { authenticateAdmin } = require('../middlewares/authenticate');

// 添加外掛到系統外掛清單
router.post('/system/plugins', authenticateAdmin, controller.addSystemPlugin);

// 查找系統的已有外掛
router.get('/system/plugins', controller.getSystemPlugins);

// 刪除系統的已有外掛
router.delete('/system/plugins/:plugin_id', controller.deleteSystemPlugin);

// 查找使用者的已有外掛
router.get('/plugins', controller.getUserPlugins);

// 添加特定外掛到使用者插件清單
router.post('/plugins/:plugin_id', controller.addUserPlugin);

// 刪除特定外掛從使用者插件清單
router.delete('/plugins/:plugin_id', controller.deleteUserPlugin);

// 代理請求的路由
router.post('/plugins/:plugin_id/:action', pluginProxyController.sendPluginProxyRequest);

module.exports = router;

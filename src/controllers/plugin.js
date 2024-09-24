const service = require('../services/plugin'); // 假設服務層已經實現了 UserPluginService
const pluginProxyService = require('../services/pluginProxy'); // 假設服務層已經實現了 UserPluginService

// 添加外掛到系統外掛清單
const addSystemPlugin = async (req, res, next) => {
  try {
    const {
      plugin_name, plugin_desc, plugin_apis, plugin_path, ui_event_handler,
    } = req.body;
    const plugin = await service.addSystemPlugin(plugin_name, plugin_desc, plugin_apis, plugin_path, ui_event_handler);
    res.status(201).json({ success: true, message: 'Plugin added successfully to system', plugin });
  } catch (error) {
    next(error);
  }
};

// 獲取系統外掛清單
const getSystemPlugins = async (req, res, next) => {
  try {
    const plugins = await service.getSystemPlugins();
    res.status(200).json({ success: true, message: 'Plugins retrieved successfully', plugins });
  } catch (error) {
    next(error);
  }
};

// 刪除特定系統外掛
const deleteSystemPlugin = async (req, res, next) => {
  try {
    const { plugin_id } = req.params;
    await service.deleteSystemPlugin(plugin_id);
    res.status(200).json({ success: true, message: 'Plugin deleted successfully from system' });
  } catch (error) {
    next(error);
  }
};

// 查找使用者的所有外掛
const getUserPlugins = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const plugins = await service.getUserPlugins(user_id);
    // console.log(plugins);
    res.status(200).json({ success: true, message: 'User plugins retrieved successfully', plugins });
  } catch (error) {
    next(error);
  }
};

// 添加外掛到使用者外掛清單
const addUserPlugin = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const { plugin_id } = req.params;
    const plugin = await service.addUserPlugin(user_id, plugin_id);
    res.status(201).json({ success: true, message: 'Plugin added successfully to user', plugin });
  } catch (error) {
    next(error);
  }
};

// 刪除特定使用者外掛
const deleteUserPlugin = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const { plugin_id } = req.params;
    const plugin = await service.deleteUserPlugin(user_id, plugin_id);
    if (!plugin) {
      return res.status(404).json({ success: false, message: 'Plugin not found' });
    }
    res.status(200).json({ success: true, message: 'Plugin deleted successfully from user' });
  } catch (error) {
    next(error);
  }
};

const sendPluginRequest = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const { plugin_id, apiType } = req.params;
    const { type, data } = req.body;
    console.log(user_id, plugin_id, apiType, type, data);

    // 調用 pluginProxyService 發送請求
    const result = await pluginProxyService.sendRequest(user_id, plugin_id, apiType, type, data);

    // 返回結果給用戶
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addSystemPlugin,
  getSystemPlugins,
  getUserPlugins,
  addUserPlugin,
  deleteUserPlugin,
  deleteSystemPlugin,
  sendPluginRequest,
};

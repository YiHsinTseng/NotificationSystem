const UserPlugin = require('../models/userPluginMongoose'); // 假設你已經定義了 UserPlugin 模型
const { Plugin } = require('../models/pluginMongoose'); // 假設你已經定義了 Plugin 模型
const AppError = require('../utils/appError');
const User = require('../models/user');

// 添加外掛到系統外掛中
const addSystemPlugin = async (plugin_name, plugin_desc, plugin_apis, plugin_path, ui_event_handler) => {
  try {
    const newPlugin = new Plugin({
      plugin_name, plugin_desc, plugin_apis, plugin_path, ui_event_handler,
    }); // 無法自由呈現無關mongoose
    // await plugin.validate(); // 確保外掛數據是有效的

    // 儲存到系統外掛清單中
    const savedPlugin = await newPlugin.save();
    return savedPlugin;
  } catch (error) {
    throw new AppError(500, `Error adding plugin to system: ${error.message}`);
  }
};

// 獲取系統外掛列表
const getSystemPlugins = async () => {
  try {
    const plugins = await Plugin.getAllPlugins();
    return plugins;
  } catch (error) {
    throw new AppError(500, `Error getting plugin: ${error.message}`);
  }
};

// 刪除系統外掛
const deleteSystemPlugin = async (plugin_id) => {
  try {
    // Delete a plugin by its ID
    const result = await Plugin.findByIdAndDelete(plugin_id);

    if (!result) {
      throw new AppError(404, `Plugin with ID ${plugin_id} not found`);
    }

    return result;
  } catch (error) {
    throw new AppError(500, `Error deleting plugin: ${error.message}`);
  }
};

// 查找使用者的所有外掛
const getUserPlugins = async (user_id) => {
  try {
    const plugins = await UserPlugin.getPlugins(user_id);
    return plugins;
  } catch (error) {
    throw new AppError(500, `Error retrieving plugins: ${error.message}`);
  }
};

// 添加外掛到使用者外掛中
const addUserPlugin = async (user_id, plugin_id) => {
  try {
    const userPlugin = await UserPlugin.findOne({ _id: user_id });

    const pluginExists = userPlugin.plugins.some((p) => p.plugin_id === plugin_id);

    if (pluginExists) {
      throw new AppError(400, 'Plugin Exists');
    }

    const plugin = await Plugin.findById(plugin_id);

    plugin.plugin_config = {}; // 這樣就會自動生成？但如何消除＿V0

    const newUserPlugin = plugin.toJSON(); // 避免存到機密資料

    userPlugin.plugins.push(newUserPlugin);

    // 保存使用者外掛資料
    await userPlugin.save();

    return newUserPlugin;
  } catch (error) {
    throw new AppError(500, `Error adding plugin: ${error.message}`);
  }
};

// 刪除使用者外掛
const deleteUserPlugin = async (user_id, plugin_id) => {
  try {
    const userPlugin = await UserPlugin.findOne({ _id: user_id });

    if (!userPlugin) {
      throw new AppError(404, 'User not found');
    }

    const pluginExists = userPlugin.plugins.some((p) => p.plugin_id === plugin_id);

    if (!pluginExists) {
      throw new AppError(404, 'Plugin not found');
    }
    userPlugin.plugins = userPlugin.plugins.filter((plugin) => plugin._id !== plugin_id);
    // 保存更新后的使用者外掛記錄
    await userPlugin.save();
    return userPlugin.plugins;
  } catch (error) {
    throw new AppError(500, `Error removing plugin: ${error.message}`);
  }
};

module.exports = {
  addSystemPlugin,
  getSystemPlugins,
  deleteSystemPlugin,
  getUserPlugins,
  addUserPlugin,
  deleteUserPlugin,
};

const mongoose = require('mongoose');
const { generateUserId } = require('../utils/generateId');
const { pluginSchema } = require('./pluginMongoose');
const AppError = require('../utils/appError');

const { Schema } = mongoose;

// 用戶 Schema
const UserPluginSchema = new Schema({
  _id: {
    type: String, default: generateUserId, alias: 'user_id',
  },
  plugins: [pluginSchema], // 外掛資料嵌套在用戶資料中
});

// 靜態方法
UserPluginSchema.statics.findById = async function (user_id) {
  const userPlugin = await this.findOne({ _id: user_id }).exec();
  if (!userPlugin) {
    throw new AppError(404, 'User not found or invalid user ID');
  }
  return userPlugin;
};

UserPluginSchema.statics.getPlugins = async function (user_id) {
  const userPlugin = await this.findOne({ _id: user_id }).exec();
  if (!userPlugin) {
    throw new AppError(404, 'No user plugins found for the given user ID');
  }
  const { plugins } = userPlugin;// 會透露太多細節
  if (plugins.length >= 0) {
    return plugins;
  }
  // return { success: false, message: 'No plugins found for the user' };
  // throw new AppError(404, 'No plugins found for the user');
};

UserPluginSchema.statics.findPluginById = async function (user_id, plugin_id) {
  const userPlugin = await this.findOne({ _id: user_id }).exec();
  if (!userPlugin) {
    throw new AppError(404, 'User not found or invalid user ID');
  }
  const plugin = userPlugin.plugins.id(plugin_id); // 正確地使用 .id()
  if (!plugin) {
    throw new AppError(404, 'Plugin not found or invalid plugin ID');
  }
  return { userPlugin, plugin };
};

const UserPlugin = mongoose.model('UserPlugin', UserPluginSchema);

module.exports = UserPlugin;

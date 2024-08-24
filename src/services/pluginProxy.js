const axios = require('axios');
const UserPlugin = require('../models/userPluginMongoose'); // 引入 Plugin 模型
const { Plugin } = require('../models/pluginMongoose'); // 引入 Plugin 模型
const User = require('../models/user'); // 引入 Plugin 模型

const sendRequest = async (user_id, plugin_id, apiType, type, data) => {
  try {
    // 從資料庫中找到對應的插件
    const { userPlugin } = await UserPlugin.findPluginById(user_id, plugin_id);

    const plugin = await Plugin.findOne({ _id: plugin_id });// api算機密

    if (!plugin) {
      throw new Error('Plugin not found');
    }

    // 根據 apiType 獲取對應的 API URL
    const apiUrl = plugin.plugin_apis[apiType];
    if (!apiUrl) {
      throw new Error(`API type "${apiType}" not found in plugin`);
    }

    console.log(apiUrl);// 目前查不用user_id
    console.log(data);
    // 使用 axios 發送 HTTP 請求

    // pg_api要增加type[enum]
    // const response = await axios.post(apiUrl, requestData);// 還是要改有type
    // 驗證之後再寫

    const public_id = await User.findPublicIdByUserId(user_id);
    const response = await axios.post(apiUrl, { type, user_id: public_id, data });// 404 error因為沒有user_id
    console.log(response.data);
    // 返回請求結果
    return response.data;
  } catch (error) {
    console.error(`Error in PluginProxyService.sendRequest: ${error.message}`);
    throw error;
  }
};

module.exports = { sendRequest };

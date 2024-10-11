const axios = require('axios');
const UserPlugin = require('../models/userPluginMongoose');
const { Plugin } = require('../models/pluginMongoose');
const User = require('../models/user');

const sendRequest = async (user_id, plugin_id, apiType, type, data) => {
  try {
    const plugin = await Plugin.findOne({ _id: plugin_id });

    const { userPlugin } = await UserPlugin.findPluginById(user_id, plugin_id);

    if (!plugin) {
      throw new Error('Plugin not found');
    }
    if (!userPlugin) {
      throw new Error('Plugin not found allowed by user');
    }

    const apiUrl = plugin.plugin_apis[apiType];
    if (!apiUrl) {
      throw new Error(`API type "${apiType}" not found in plugin`);
    }

    console.log(apiUrl);

    const public_id = await User.findPublicIdByUserId(user_id);
    let response;

    if (apiType === 'subInfo' || apiType === 'jobSubInfo') {
      response = await axios({
        method: 'get',
        url: `${apiUrl}/${public_id}`,
      });
      return response.data;
    }
    response = await axios.post(apiUrl, { type, user_id: public_id, data });
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error(`Error in PluginProxyService.sendRequest: ${error.message}`);
    throw error;
  }
};

module.exports = { sendRequest };

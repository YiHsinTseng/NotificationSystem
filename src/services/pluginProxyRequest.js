const axios = require('axios');
const UserPlugin = require('../models/userPluginMongoose');
const { Plugin } = require('../models/pluginMongoose');
const User = require('../models/user');
const AppError = require('../utils/appError');

const sendRequest = async (user_id, plugin_id, action, method, data) => {
  const plugin = await Plugin.findOne({ _id: plugin_id });// api算機密

  if (!plugin) {
    throw new Error('Plugin not found');
  }

  const { userPlugin } = await UserPlugin.findPluginById(user_id, plugin_id);
  if (!userPlugin) {
    throw new Error('Plugin not found allowed by user');
  }

  const apiConfig = plugin.plugin_apis[action];

  if (!apiConfig) {
    throw new Error(`API type "${action}" not found in plugin`);
  }

  const public_id = await User.findPublicIdByUserId(user_id);

  console.log(public_id);
  // TODO 防禦程式設計在放在服務層還是控制層

  try {
    let { url } = apiConfig;
    const replaceParams = (apiUrl, params, requestBody) => Object.entries(params).reduce((acc, [param, value]) => {
      let replaceValue;
      if (requestBody && value.startsWith('body.')) {
        const bodyKey = value.split('.')[1];
        replaceValue = requestBody[bodyKey];
      }
      if (value === 'public_id') {
        replaceValue = public_id;
      }
      if (replaceValue !== undefined) {
        return acc.replace(`:${param}`, replaceValue);
      }
      return acc;
    }, apiUrl);

    if (apiConfig.replace.path_params) {
      url = replaceParams(url, apiConfig.replace.path_params, data);
    }
    console.log(url);

    const options = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (apiConfig.method.includes(method)) {
      const body = { ...data };
      console.log(apiConfig.replace.body);

      const updatedBody = apiConfig.replace.body
        ? Object.entries(apiConfig.replace.body).reduce((acc, [key, value]) => {
          // 如果 value 是 public_id，使用 public_id；否則使用 data[value]
          acc[key] = value === 'public_id' ? public_id : data[value];
          return acc;
        }, { user_id: public_id })
        : { user_id: public_id };

      options.data = { ...body, ...updatedBody };
    }

    console.log(options);
    const response = await axios(options);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.data.message);
      throw new AppError(error.response.status, error.response.data.message);
    } else {
      console.error('Axios request error:', error.message);
      throw new Error('Request error');
    }
  }
};

module.exports = { sendRequest };

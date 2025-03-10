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

  // TODO 防禦程式設計在放在服務層還是控制層

  try {
    let { url } = apiConfig;
   
    /* 替換URL中的機密資訊 */ 

    // 以params中的key為單位進行迭代替換參數(將目標API的params以body或特定值進行替換)
    const getReplaceValue = (requestBody,value) => {
      if (requestBody && value.startsWith('body.')) {
        const bodyKey = value.split('.')[1];
        return requestBody[bodyKey]; 
      }
      if (value === 'public_id') {
        return public_id;
      }
      return undefined;
    };
    
    const replaceParams = (apiUrl,requestBody, params) => Object.entries(params).reduce((acc, [param, value]) => {
      const replaceValue = getReplaceValue( requestBody,value);
      if (replaceValue !== undefined) {
        return acc.replace(`:${param}`, replaceValue);
      }
      return acc;
    }, apiUrl);//初始值
  
    if (apiConfig.replace.path_params) {
      url = replaceParams(url, data, apiConfig.replace.path_params);
    }

    //基本傳輸參數設定(不包含body)
    const options = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    //專門替換body中的user_id
    if (apiConfig.method.includes(method)) {
      const body = { ...data };
      const updatedBody = apiConfig.replace.body
        ? Object.entries(apiConfig.replace.body).reduce((acc, [key, value]) => {
          // 如果 value 是 public_id，使用 public_id；否則使用 data[value]
          acc[key] = value === 'public_id' ? public_id : data[value];
          return acc;
        }, { user_id: public_id })
        : { user_id: public_id };
      options.data = { ...body, ...updatedBody };
    }

    console.log(options)
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

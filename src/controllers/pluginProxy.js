const pluginProxyService = require('../services/pluginProxyRequest'); // 假設服務層已經實現了 UserPluginService

const sendPluginProxyRequest = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const { plugin_id, action } = req.params;
    const { method, data } = req.body;
    console.log(req.body);
    console.log(user_id, plugin_id, action, method, data);

    // 調用 pluginProxyService 發送請求
    const result = await pluginProxyService.sendRequest(user_id, plugin_id, action, method, data);

    // 返回結果給用戶
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendPluginProxyRequest,
};

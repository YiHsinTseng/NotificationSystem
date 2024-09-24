const mongoose = require('mongoose');
const { generatePluginId, generatePluginUserId } = require('../utils/generateId');

const { Schema } = mongoose;

// 外掛配置 Schema，僅作為外掛設定的容器
const pluginConfigSchema = new Schema(
  {
    PluginUserId: { type: String, default: generatePluginUserId, alias: 'plugin_user_id' },
    otherConfig: { type: Map, of: String }, // 其他配置項目
  },
  { _id: false }, // 禁用 `_id` 以避免為每個配置項創建單獨的 ID
);

const uiEventHandlerSchema = new Schema({
  sidebar: {
    type: Map,
    of: new Schema({
      byNotifField: {
        sender: { type: String, required: true },
        type: { type: Schema.Types.Mixed, required: true }, // 可以是單一值或數組
      },
      action: { type: String, required: true }, // 可以是自定義字串
    }, { _id: false }),
    default: {},
  },
}, { _id: false }); // 禁用 `_id` 以避免為每個配置項創建單獨的 ID

// 外掛 Schema
const pluginSchema = new Schema({
  _id: { type: String, default: generatePluginId, alias: 'plugin_id' },
  plugin_name: { type: String, required: true },
  plugin_desc: { type: String },
  plugin_apis: { type: Schema.Types.Mixed },
  plugin_path: { type: String },
  plugin_config: { type: pluginConfigSchema }, // 使用 pluginConfigSchema 作為插件配置
  ui_event_handler: { type: uiEventHandlerSchema }, // 添加 ui_event_handler
}, {
  toJSON: {
    transform(doc, ret) {
      const {
        _id, __v, plugin_apis, plugin_config, ...rest// 避免顯示機密資訊(plugin_config.id)
      } = ret;
      const newRet = { plugin_id: _id, ...rest };
      return newRet;
    },
  },
});

pluginSchema.statics.getAllPlugins = async function getAllPlugins() {
  const plugins = await this.find().select('-__v');
  const pluginObjects = plugins.map((plugin) => {
    const pluginObject = plugin.toJSON(); // 這樣get就不會有機密資訊
    return pluginObject;
  });
  return pluginObjects;
};

const Plugin = mongoose.model('Plugin', pluginSchema);// 擺的位置很重要

module.exports = { Plugin, pluginSchema };

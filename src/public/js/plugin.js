const pluginButton = document.getElementById('plugin-button');
const pluginContainer = document.getElementById('plugin-container');
const availablePluginsElement = document.getElementById('available-plugins');
const userPluginsElement = document.getElementById('user-plugins');

const jobPluginContainer = document.getElementById('job-plugin-container');

const jobPluginName = 'Job_Sub_Pub'; // TODO 有需要這樣解耦嗎？

let plugins = [];
let userPlugins = []; // 要共用要擺對位置?併發會不會有問題
let isJobPluginEnabled = false;

export default function initializePlugin(token) {
// 插件模組

  function displayPlugins() {
    // 如果 userPlugins 或 plugins 未定義，給它們賦一個默認值
    userPlugins = userPlugins || [];
    plugins = plugins || [];

    userPluginsElement.innerHTML = '';
    availablePluginsElement.innerHTML = '';

    // 從 plugins 中過濾掉已經在 userPlugins 中的插件
    const userPluginIds = new Set(userPlugins.map((plugin) => plugin.plugin_id));
    const availablePluginsFiltered = plugins.filter((plugin) => !userPluginIds.has(plugin.plugin_id));

    // 創建並添加「小標題」區域
    const userTitle = document.createElement('h4');
    userTitle.textContent = '已用插件';
    userPluginsElement.appendChild(userTitle);

    const availableTitle = document.createElement('h4');
    availableTitle.textContent = '可用插件';
    availablePluginsElement.appendChild(availableTitle);

    // 顯示用戶插件
    userPlugins.forEach((plugin) => {
      const pluginItem = document.createElement('div');
      pluginItem.className = 'plugin-item';
      pluginItem.innerHTML = `<strong>${plugin.plugin_name}</strong>`;

      const removeButton = document.createElement('button');
      removeButton.className = 'plugin-action-button remove';
      removeButton.textContent = '移除';
      removeButton.onclick = () => removePlugin(plugin.plugin_id);

      pluginItem.appendChild(removeButton);
      userPluginsElement.appendChild(pluginItem);
    });

    function addPlugin(plugin_id) {
      fetch(`/plugins/${plugin_id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).then((response) => response.json())
        .then((data) => {
          if (data.success) { // 修正
          //   console.log(data)
            userPlugins.push(data.plugin);
            displayPlugins();
          }
        });
      jobPluginContainer.style.display = 'block'; // 隱藏職位資訊容器
    }

    function removePlugin(plugin_id) {
      // console.log(plugin_id)
      fetch(`/plugins/${plugin_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).then((response) => response.json())
        .then((data) => {
          if (data.success) { // 修正
            userPlugins = userPlugins.filter((plugin) => plugin.plugin_id !== plugin_id);
            console.log(userPlugins);
            displayPlugins();
          }
        });
      jobPluginContainer.style.display = 'none'; // 隱藏職位資訊容器
    }

    // 顯示可用插件
    availablePluginsFiltered.forEach((plugin) => {
      const pluginItem = document.createElement('div');
      pluginItem.className = 'plugin-item';
      pluginItem.innerHTML = `<strong>${plugin.plugin_name}</strong>`;

      const addButton = document.createElement('button');
      addButton.className = 'plugin-action-button add';
      addButton.textContent = '添加';
      addButton.onclick = () => addPlugin(plugin.plugin_id);

      pluginItem.appendChild(addButton);
      availablePluginsElement.appendChild(pluginItem);
    });
  }

  function fetchPlugins() {
    fetch('/system/plugins', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((data) => {
        plugins = data.plugins;
        //   userPlugins = data.userPlugins;
        displayPlugins();
      });
  }

  function fetchUserPlugins() {
    fetch('/plugins', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((data) => {
        userPlugins = data.plugins;
        displayPlugins();
      });
  }
  pluginButton.addEventListener('click', () => {
    pluginContainer.style.display = pluginContainer.style.display === 'none' ? 'block' : 'none';
  });

  function checkJobPlugin() {
  // 檢查插件狀態
    isJobPluginEnabled = userPlugins.some((plugin) => plugin.plugin_name === jobPluginName); // 如何與id有所連結？讓系統方便代理請求 //TODO
    console.log(userPlugins);
    return isJobPluginEnabled;
  }
  return {
    checkJobPlugin, fetchUserPlugins, fetchPlugins,
  };
}

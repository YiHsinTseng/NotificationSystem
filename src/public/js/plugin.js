let instance;

export default function initializePlugin(token) {
// 插件模組
  if (instance) {
    return instance; // 返回已經初始化過的實例
  }

  const pluginButton = document.getElementById('plugin-button');
  const pluginContainer = document.getElementById('plugin-container');
  const availablePluginsElement = document.getElementById('available-plugins');
  const userPluginsElement = document.getElementById('user-plugins');

  const pluginAdminContainer = document.getElementById('plugin-admin-container');
  const addPluginForm = document.getElementById('pluginForm');
  const pluginNameInput = document.getElementById('plugin_name');
  const pluginApisInput = document.getElementById('plugin_apis');
  const errorMessage = document.getElementById('errorMessage');
  const responseMessage = document.getElementById('responseMessage');

  const jobPluginContainer = document.getElementById('job-plugin-container');
  const jobPluginName = 'Job_Sub_Pub'; // TODO 有需要這樣解耦嗎？

  let plugins = [];
  let userPlugins = []; // 要共用要擺對位置?併發會不會有問題
  let isJobPluginEnabled = false;

  const isAdmin = localStorage.getItem('isAdmin') === 'true'; // localstorage存字串
  if (isAdmin) {
    pluginAdminContainer.style.display = 'block';
  }
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

  addPluginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    errorMessage.textContent = ''; // Clear previous error
    responseMessage.textContent = ''; // Clear previous success message

    const pluginName = pluginNameInput.value.trim();
    const pluginApis = pluginApisInput.value.trim();

    try {
      // Validate JSON format
      const parsedApis = JSON.parse(pluginApis);

      // If JSON is valid, simulate API submission
      const formData = {
        plugin_name: pluginName,
        plugin_apis: parsedApis,
      };

      fetch('/system/plugins', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      }).then((response) => response.json())
        .then((data) => {
          // Display success message
          responseMessage.textContent = 'API data submitted successfully:';
          // responseMessage.textContent += `\n${JSON.stringify(formData, null, 2)}`;
        });
    } catch (error) {
      // Display error if JSON is invalid
      errorMessage.textContent = 'Invalid JSON format in Plugin APIs.';
    }
  });

  function checkJobPlugin() {
  // 檢查插件狀態
    isJobPluginEnabled = userPlugins.some((plugin) => plugin.plugin_name === jobPluginName); // 如何與id有所連結？讓系統方便代理請求 //TODO
    console.log(userPlugins);
    return isJobPluginEnabled;
  }
  // return {
  //   checkJobPlugin, fetchUserPlugins, fetchPlugins,
  // };
  instance = {
    checkJobPlugin, fetchUserPlugins, fetchPlugins,
  };

  return instance; // 返回初始化後的實例
}
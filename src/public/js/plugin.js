import initializeJobPlugin from './jobPlugin.js';

let instance;
// ES6 模塊自帶作用域隔離，每個模塊都是獨立的，無需擔心變數覆蓋的問題。

export default function initializePlugin(token) {
// 插件模組
  if (instance) {
    return instance; // 返回已經初始化過的實例，不會有後續處理
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

  let plugins = [];
  let userPlugins = []; // 要共用要擺對位置?併發會不會有問題

  // TODO 有需要這樣解耦嗎？
  // 讓每個plugin都有對應相同函式，然後迭代
  const jobPluginName = 'Job_Sub_Pub';
  const job_plugin_id = '7ab0c877-6126-4c12-9587-2b32cb0d9f6d';

  const { openJobs, openJobInfo, pluginSideBarContainer } = initializeJobPlugin(token, job_plugin_id);
  //
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
      fetch(`api/plugins/${plugin_id}`, {
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
      // jobPluginContainer.style.display = 'block'; // 顯示職位資訊容器
      // initializeJobPlugin(token, job_plugin_id).pluginSideBarContainer.style.display = 'block'; // 顯示職位資訊容器
      initializeJobPlugin(token, job_plugin_id).pluginSideBarContainer.style.display = 'flex'; // 顯示職位資訊容器
      // 再次顯示大小會改變？
    }

    function removePlugin(plugin_id) {
      // console.log(plugin_id)
      fetch(`api/plugins/${plugin_id}`, {
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
      // jobPluginContainer.style.display = 'none'; // 隱藏職位資訊容器
      initializeJobPlugin(token, job_plugin_id).pluginSideBarContainer.style.display = 'none'; // 隱藏職位資訊容器
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
    fetch('api/system/plugins', {
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
    fetch('api/plugins', {
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

      fetch('api/system/plugins', {
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

  async function handleNotification(notifications, notification) {
    let isJobPluginEnabled = false;
    // 其中一個關於job_plugin的判斷（要插分成查表、加載js、）
    function checkJobPlugin() {
      // 檢查插件狀態
      isJobPluginEnabled = userPlugins.some((plugin) => plugin.plugin_name === jobPluginName); // 如何與id有所連結？讓系統方便代理請求 //TODO
      console.log(userPlugins);
      return isJobPluginEnabled;
    }

    isJobPluginEnabled = checkJobPlugin();

    // console.log(notification.sender)
    if (notification.sender === 'Job_Pub' && notification.type === 'routine') {
      if (isJobPluginEnabled) {
        await openJobs(notifications, notification.notification_id);
      } else {
        alert('Job plugin is not enabled.');
      }
    }
    if (notification.sender === 'Job_Pub' && (notification.type === 'job_id_channel' || notification.type === 'company_name_channel')) {
      if (isJobPluginEnabled) {
        await openJobInfo(notifications, notification.notification_id);
      } else {
        alert('Job plugin is not enabled.');
      }
    }
  }
  // TODO 耦合插件
  // 根據sender判斷屬性，來發送api
  // 觸發條件（JSON格式）與發送api
  // {
  //   "Job_Sub_Pub": {
  //     "on_sidebar": {
  //       "openJobs":{
  //         "by": {
  //           "sender": "Job_Pub",
  //           "type": "routine"
  //         },
  //         "action": "openJobs()"
  //       },
  //       "openJobsInfo":{
  //         "by": {
  //           "sender": "Job_Pub",
  //           "type": ["job_id_channel","company_name_channel"]
  //         },
  //         "action": "openJobInfo()"
  //       }
  //     }
  //   }
  // }

  instance = {
    fetchUserPlugins, fetchPlugins, handleNotification,
  };

  return instance; // 返回初始化後的實例
}

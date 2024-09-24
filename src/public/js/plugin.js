// import initializeJobPlugin from './plugins/jobPlugin.js';// 不要引用要用相對路徑

// ES6 模塊自帶作用域隔離，每個模塊都是獨立的，無需擔心變數覆蓋的問題。

function getDomElement() {
  return {
    pluginButton: document.getElementById('plugin-button'),
    pluginContainer: document.getElementById('plugin-container'),
    availablePluginsElement: document.getElementById('available-plugins'),
    userPluginsElement: document.getElementById('user-plugins'),

    pluginAdminContainer: document.getElementById('plugin-admin-container'),
    addPluginForm: document.getElementById('pluginForm'),
    pluginNameInput: document.getElementById('plugin_name'),
    pluginApisInput: document.getElementById('plugin_apis'),
    pluginUIInput: document.getElementById('plugin_ui'),
    errorMessage: document.getElementById('errorMessage'),
    responseMessage: document.getElementById('responseMessage'),
  };
}

export function initializePlugin(token) {
  const {
    availablePluginsElement,
    pluginAdminContainer,
    userPluginsElement,
  } = getDomElement();

  const isAdmin = localStorage.getItem('isAdmin') === 'true'; // localstorage存字串
  if (isAdmin) {
    pluginAdminContainer.style.display = 'block';
  }
  // TODO這裡可能是問題點
  let plugins = [];
  let userPlugins = []; // 要共用要擺對位置?併發會不會有問題

  // 這樣就不會因為刪除而遺忘container了，因為html也不會消除

  // TODO PG消除刷新之後還是會消失
  const containersCache = {};
  function handlePlugins(plugin_id) {
    // 如果已經有該 plugin_id 的全局容器，則直接返回它
    if (containersCache[plugin_id]) {
      return containersCache[plugin_id];
    }

    const idx = userPlugins.findIndex((plugin) => plugin.plugin_id === plugin_id);
    if (idx !== -1) {
    // 緩存原始的 DOM 容器
      const originalContainer = userPlugins[idx].pluginSideBarContainer;
      containersCache[plugin_id] = originalContainer;// TODO消除刷新之後還是會消失
      return originalContainer; // 返回原始的 DOM 容器
    }

    // 如果找不到插件，返回 null
    return null;
  }

  // 檢查本地檔案是否存在的函數
  async function checkFileExists(filePath) {
    try {
      const response = await fetch(`js/${filePath}`, { method: 'GET' });
      return response.ok; // 如果檔案存在，返回 true
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false; // 如果檢查過程中出錯，返回 false
    }
  }

  // TODO userPlugins可透過Load函式如何與initializeJobPlugin有連結
  // TODO loadAndInitializeJobPlugin應該要整合其他兩個函式的功能
  async function loadAndInitializeJobPlugin(token, userPlugins) {
    console.log('開始載入不同套件', userPlugins);
    try {
      await Promise.all(userPlugins.map(async (item) => { // 因為map是同步返回array
      // 動態載入 JS 檔案

        // 腳本本來就在雲端，因為我是伺服器渲染

        const filePath = `./plugins/${item.plugin_path}`;

        // 檢查插件檔案是否存在
        const fileExists = await checkFileExists(filePath);

        if (!fileExists) {
          console.log(`Plugin file does not exist at path: ${filePath}`);
        }// TODO fetch錯誤還是會顯示

        const PluginModule = await import(filePath);

        // 從載入的模組中取得 initializeJobPlugin 函式
        // TODO 同檔案因為intial 兩次會有兩個container?DOM只會改第一個

        // TODO 插件監聽器要跟函數分開嗎
        // 插件只會載入一次
        const { setupEventListeners, initializePlugin } = PluginModule;
        const { pluginSideBarContainer } = await setupEventListeners(token, item.plugin_id);// 這裡還是要單例
        const { openJobs, openJobInfo } = await initializePlugin(token, item.plugin_id);

        item.pluginSideBarContainer = pluginSideBarContainer;// TODO 存在這裡如果刪掉很尷尬，要是要了解具體行為（全局觀），目前是讓container資訊被copy

        // 根據插件配置調用對應的函數

        const actions = item.ui_event_handler.sidebar;

        if (actions.openJobs.action === 'openJobs') {
          actions.openJobs.func = openJobs;
        }

        if (actions.openJobsInfo.action === 'openJobInfo') {
          actions.openJobsInfo.func = openJobInfo;
        }
      }));
      // console.log(userPlugins);
      return userPlugins;
    } catch (error) {
      console.error('Failed to load the job plugin:', error);
    }
  }

  async function handleNotification(notifications, notification, userPlugins) {
    console.log('按鈕觸發', userPlugins);
    function generateConditions(data) {
      const handlers = [];

      data.forEach((plugin) => {
        const eventHandlers = plugin.ui_event_handler.sidebar;

        for (const handlerKey in eventHandlers) {
          const { byNotifField, func } = eventHandlers[handlerKey];
          const { sender } = byNotifField;
          const types = Array.isArray(byNotifField.type) ? byNotifField.type : [byNotifField.type];

          types.forEach((type) => {
            handlers.push({
              sender,
              type,
              func,
            });
          });
        }
      });

      return handlers;
    }
    const handlers = generateConditions(userPlugins);
    console.log('ADDED DOM', handlers);
    handlers.forEach(async (handler) => {
      if (notification.sender === handler.sender && notification.type === handler.type) {
        await handler.func(notifications, notification.notification_id); // 動態調用對應的函數
      }
    });
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

  async function addPlugin(plugin_id) {
    await fetch(`api/plugins/${plugin_id}`, {
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
          console.log('add NOW PG', userPlugins);
          // checkPlugins();
          loadAndInitializeJobPlugin(token, userPlugins)
            .then(() => {
              handlePlugins(plugin_id).style.display = 'flex';
              displayPlugins();
            });
        }
      });
  }

  async function removePlugin(plugin_id) {
    // console.log(plugin_id)
    await fetch(`api/plugins/${plugin_id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((data) => {
        if (data.success) { // 修正
          handlePlugins(plugin_id).style.display = 'none';// TODO用刪除還是添加style比較好，或去修改css樣式就好，不用直接刪除element
          userPlugins = userPlugins.filter((plugin) => plugin.plugin_id !== plugin_id);
          console.log('NOW PG', userPlugins);
          displayPlugins();
        }
      });
  }

  async function fetchPluginsAndUserPlugins() {
    const pluginFetch = fetch('api/system/plugins', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json());

    const userPluginFetch = fetch('api/plugins', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json());

    // 這樣才有回傳值
    return Promise.all([pluginFetch, userPluginFetch])
      .then(([pluginData, userPluginData]) => {
        plugins = pluginData.plugins;
        userPlugins = userPluginData.plugins;
        console.log('Fetch PG', userPlugins);
        return loadAndInitializeJobPlugin(token, userPlugins)
          .then(() => {
            displayPlugins();
            return userPlugins;
          });
      })
      .catch((error) => {
        console.error('Error fetching plugins:', error);
      });
  }

  return {
    fetchPluginsAndUserPlugins, handleNotification, userPlugins,
  };
}

export async function setupPluginEventListeners(token) {
  const {
    pluginButton,
    pluginContainer,
    addPluginForm,
    pluginNameInput,
    pluginApisInput,
    pluginUIInput,
    errorMessage,
    responseMessage,
  } = getDomElement();

  // const { fetchPluginsAndUserPlugins } = initializePlugin(token);// TODO 要放在這裡嗎

  // const userPlugins = await fetchPluginsAndUserPlugins();// TODO 要放在這裡嗎
  // console.log(8881, userPlugins);

  pluginButton.addEventListener('click', () => {
    pluginContainer.style.display = pluginContainer.style.display === 'none' ? 'block' : 'none';
  });

  addPluginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    errorMessage.textContent = ''; // Clear previous error
    responseMessage.textContent = ''; // Clear previous success message

    // TODO path目前跟pluginName一樣是否獨立出來
    const pluginName = pluginNameInput.value.trim();
    const pluginApis = pluginApisInput.value.trim();
    const pluginUI = pluginUIInput.value.trim();

    // Define a regex pattern for valid plugin name (adjust as needed)
    const namePattern = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

    // Validate pluginName
    if (!namePattern.test(pluginName)) {
      errorMessage.textContent = 'Plugin name must start with a letter and can only contain letters, numbers, underscores, or hyphens.';
      return;
    }
    try {
      // Validate JSON format
      const parsedApis = JSON.parse(pluginApis);
      const parsedUI = JSON.parse(pluginUI);

      // If JSON is valid, simulate API submission
      const formData = {
        plugin_name: pluginName,
        plugin_apis: parsedApis,
        plugin_path: `${pluginName}.js`,
        ui_event_handler: parsedUI,
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
          if (data.success !== true) {
            throw new Error(data.message);
          }
          responseMessage.textContent = 'API data submitted successfully:';
          // fetchPluginsAndUserPlugins();
          window.location.reload();// 重新載入才能添加監聽器
        });
      // 錯誤還是會添加
    } catch (error) {
      if (error instanceof SyntaxError) {
        errorMessage.textContent = 'Invalid JSON format in Plugin APIs or Plugin UI.';
      } else {
        errorMessage.textContent = `Error: ${error.message}`;
      }
    }
  });
}

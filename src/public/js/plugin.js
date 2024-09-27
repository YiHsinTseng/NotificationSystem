import {
  addPlugin, postPlugin, removePlugin, fetchPlugins, fetchUserPlugins,
} from './apis.js';

// UI
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

// Plugin 載入

// 檢查本地檔案是否存在的函數
async function checkFileExists(filePath) {
  try {
    const response = await fetch(`${filePath}`);
    if (!response.ok) {
      console.log(`Plugin file does not exist at path: ${filePath}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}

async function loadAndInitializeJobPlugin(token, userPlugins) {
  console.log('開始載入不同套件', userPlugins);
  try {
    await Promise.all(userPlugins.map(async (item) => { // 因為map是同步返回array
    // 動態載入 JS 檔案，腳本本來就在雲端，因為我是伺服器渲染
      const filePath = `/js/plugins/${item.plugin_path}`;
      const fileExists = await checkFileExists(filePath);
      if (fileExists) {
        const PluginModule = await import(filePath);

        // 插件只會載入一次
        const { setupEventListeners, initializePlugin } = PluginModule;
        const { pluginSideBarContainer } = await setupEventListeners(token, item.plugin_id);// 這裡還是要單例因為容器狀態是非純函數

        const pluginFunctions = await initializePlugin(token, item.plugin_id);
        item.pluginSideBarContainer = pluginSideBarContainer;

        // 根據插件配置調用對應的函數
        const actions = item.ui_event_handler.sidebar;

        // 使用動態映射來設置函數
        Object.keys(actions).forEach((actionKey) => {
          const actionConfig = actions[actionKey];
          if (pluginFunctions[actionKey] && actionConfig.action === actionKey) {
            actionConfig.func = pluginFunctions[actionKey];
          }
        });
      }

      // 動態添加 CSS 樣式表
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      const cssFilePath = `/css/${item.plugin_path.replace('.js', '.css')}`;
      const cssFileExists = await checkFileExists(cssFilePath);
      if (cssFileExists) {
        link.href = cssFilePath; // 更新為實際 CSS 文件的路徑
        document.head.appendChild(link);
      }
    }));
  } catch (error) {
    console.error('Failed to load the job plugin:', error);
  }
}

export async function handleNotification(notifications, notification, userPlugins) {
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

export function initializePluginManger(token) {
  const {
    availablePluginsElement,
    pluginAdminContainer,
    userPluginsElement,
  } = getDomElement();

  const isAdmin = localStorage.getItem('isAdmin') === 'true'; // localstorage存字串
  if (isAdmin) {
    pluginAdminContainer.style.display = 'block';
  }

  // TODO 這裡可能是問題點，因為必須初始化
  let plugins = [];
  let userPlugins = [];

  function displayPlugins(userPlugins, plugins) {
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
      removeButton.onclick = async () => {
        // 先隱藏插件容器，然後進行刪除操作
        try {
          await removePlugin(token, plugin.plugin_id);
          plugin.pluginSideBarContainer.style.display = 'none';
          userPlugins = userPlugins.filter((pl) => pl.plugin_id !== plugin.plugin_id);
          console.log('NOW PG', userPlugins);
          // 刪除成功後更新顯示
          displayPlugins(userPlugins, plugins);
        } catch (error) {
          // 如果刪除失敗，可以根據需要重新顯示容器或顯示錯誤
          console.error('Error removing plugin:', error);
          plugin.pluginSideBarContainer.style.display = 'flex'; // 重新顯示容器
        }
      };

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
      addButton.onclick = async () => {
        try {
          await addPlugin(token, plugin.plugin_id);
          userPlugins.push(plugin);
          console.log('add NOW PG', userPlugins);
          await loadAndInitializeJobPlugin(token, userPlugins);
          // 添加成功後更新顯示
          plugin.pluginSideBarContainer.style.display = 'flex';
          displayPlugins(userPlugins, plugins);
        } catch (error) {
          // 如果添加失敗，可以根據需要隱藏容器或顯示錯誤
          console.error('Error adding plugin:', error);
          plugin.pluginSideBarContainer.style.display = 'none'; // 根據需要隱藏容器
        }
      };

      pluginItem.appendChild(addButton);
      availablePluginsElement.appendChild(pluginItem);
    });
  }

  // 有fetch就要display
  async function fetchPluginsAndUserPlugins(token) {
    try {
      const [pluginData, userPluginData] = await Promise.all([
        fetchUserPlugins(token),
        fetchPlugins(token),
      ]);

      plugins = pluginData.plugins;
      userPlugins = userPluginData.plugins;
      console.log('Fetch PG', userPlugins);

      await loadAndInitializeJobPlugin(token, userPlugins);
      displayPlugins(userPlugins, plugins);

      return userPlugins;
    } catch (error) {
      console.error('Error fetching plugins:', error);
      throw error; // 重新拋出錯誤以便調用者處理
    }
  }

  return {
    fetchPluginsAndUserPlugins, userPlugins,
  };
}

// UI PG表單

// 切換插件容器的顯示邏輯
function togglePluginContainerDisplay(container) {
  return () => {
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
  };
}

// 清空錯誤訊息和成功訊息
function clearMessages(errorMessage, responseMessage) {
  errorMessage.textContent = '';
  responseMessage.textContent = '';
}

// 驗證插件表單的輸入數據
function validatePluginInputs(pluginName, pluginApis, pluginUI) {
  const namePattern = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

  // 驗證插件名稱
  if (!namePattern.test(pluginName)) {
    return 'Plugin name must start with a letter and can only contain letters, numbers, underscores, or hyphens.';
  }

  // 驗證 JSON 格式
  try {
    JSON.parse(pluginApis);
    JSON.parse(pluginUI);
  } catch (e) {
    return 'Invalid JSON format in Plugin APIs or Plugin UI.';
  }

  return null; // 無錯誤
}

// 提交插件表單到 API
async function submitPluginForm(token, pluginName, pluginApis, pluginUI) {
  const formData = {
    plugin_name: pluginName,
    plugin_apis: JSON.parse(pluginApis),
    plugin_path: `${pluginName}.js`, // TODO
    ui_event_handler: JSON.parse(pluginUI),
  };

  await postPlugin(token, formData);
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

  // 設定顯示和隱藏邏輯
  pluginButton.addEventListener('click', togglePluginContainerDisplay(pluginContainer));

  // 處理表單提交邏輯
  addPluginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // 清空之前的錯誤和回應訊息
    clearMessages(errorMessage, responseMessage);

    // 收集和驗證表單數據
    const pluginName = pluginNameInput.value.trim();
    const pluginApis = pluginApisInput.value.trim();
    const pluginUI = pluginUIInput.value.trim();

    // 驗證表單輸入
    const validationError = validatePluginInputs(pluginName, pluginApis, pluginUI);
    if (validationError) {
      errorMessage.textContent = validationError;
      return;
    }

    // 處理 API 提交
    try {
      await submitPluginForm(token, pluginName, pluginApis, pluginUI);
      responseMessage.textContent = 'API data submitted successfully.';
      window.location.reload(); // 重新加載頁面
    } catch (error) {
      errorMessage.textContent = error.message;
    }
  });
}

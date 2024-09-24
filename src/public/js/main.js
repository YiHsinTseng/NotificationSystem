import { setupNotificationEventListeners, initializeNotification } from './notification.js';
import { setupPluginEventListeners, initializePlugin } from './plugin.js';// 會重名

/*
1. 載入並初始化主要服務功能：
`1.1 通知功能:取得通知
 1.2 外掛功能:取得全局與個人外掛清單

目前查詢職缺的jwt是一天過期但通知是三天才刪除，因為資料庫筆數是以每天更新。
 */

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    window.location.href = '/login';
  } else {
    const logoutButton = document.getElementById('logout-button'); // 新增登出按鈕

    // Setup event listeners與函數要分開
    setupPluginEventListeners(token);
    const { fetchPluginsAndUserPlugins } = initializePlugin(token);
    const userPlugins = await fetchPluginsAndUserPlugins();
    console.log('全局', userPlugins);
    // 監聽器對象也會受到外部狀態影響隨之改變
    setupNotificationEventListeners(token, userPlugins);

    function logout() {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }

    logoutButton.addEventListener('click', () => {
      logout(); // 登出
    });
  }
});

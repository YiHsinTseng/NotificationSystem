import { setupNotificationEventListeners } from './notification.js';
import { setupPluginFormListeners, initializePluginManger } from './plugin.js';// 會重名

/*
1. 載入並初始化主要服務功能：
`1.1 通知功能:取得通知
 1.2 外掛功能:取得全局與個人外掛清單

目前查詢職缺的jwt是一天過期但通知是三天才刪除，因為資料庫筆數是以每天更新。
 */

function logout() {
  localStorage.removeItem('authToken');
  window.location.href = '/login';
}

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('authToken');// 過期處置

  if (!token) {
    window.location.href = '/login';
  } else {
    const logoutButton = document.getElementById('logout-button'); // 新增登出按鈕
    try {
    // Setup event listeners與函數要分開
      const { fetchPluginsAndUserPlugins } = initializePluginManger(token);
      setupPluginFormListeners(token);

      const userPlugins = await fetchPluginsAndUserPlugins(token);// 認證錯誤要如何處置

      console.log('全局', userPlugins);

      // 監聽器對象也會受到外部狀態影響隨之改變
      setupNotificationEventListeners(token, userPlugins);// 通知交互行為受外掛影響
    } catch (e) {
      console.log(e.message);
      if (e.response && e.response.status === 401) { // 只要有任何API認證錯誤就會登出
        logout();
      }
    }

    logoutButton.addEventListener('click', () => {
      console.log('登出');
      logout(); // 登出
    });
  }
});

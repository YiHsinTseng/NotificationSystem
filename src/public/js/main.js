import initializeNotification from './notification.js';
import initializePlugin from './plugin.js';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    window.location.href = '/login';
  } else {
    const logoutButton = document.getElementById('logout-button'); // 新增登出按鈕

    const { fetchNotificationCount } = initializeNotification(token);
    const { fetchPluginsAndUserPlugins } = initializePlugin(token);

    function logout() {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }

    logoutButton.addEventListener('click', () => {
      logout(); // 登出
    });

    // 初次加載時獲取通知數量
    fetchNotificationCount();
    fetchPluginsAndUserPlugins();
  }
});

import initializeSocket from './socket.js';
import initializePlugin from './plugin.js';
import initializeJobPlugin from './jobPlugin.js';
import formatDate from './dateUtils.js';

export default function initializeNotification(token) {
  const notificationCountElement = document.getElementById('notification-count');
  const notificationListElement = document.getElementById('notification-list');
  const notificationListContainer = document.getElementById('notification-list-container');
  const refreshButton = document.getElementById('refresh-button');
  const loadMoreButton = document.getElementById('load-more-button');

  let notifications = [];
  let displayedCount = 0;
  const limit = 5; // 每次顯示的數量

  const socket = initializeSocket(token);
  const { checkJobPlugin } = initializePlugin(token);
  const { openJobs, openJobInfo } = initializeJobPlugin(token);

  // 主要通知模組
  function updateView(count) {
    notificationCountElement.textContent = count;
  }

  // 獲取通知數量
  function fetchNotificationCount() {
    fetch('api/notifications', {
      headers: {
        Authorization: `Bearer ${token}`, // 把 JWT 作為 Authorization header 傳遞
      },
    })
      .then((response) => response.json())
      .then((data) => updateView(data.count))
      .catch((error) => console.error('獲取通知數量時發生錯誤:', error));
  }

  function markAsRead(notificationId) {
    // 查找通知對象
    const notification = notifications.find((n) => n.notification_id === notificationId);

    // 如果通知不存在或已讀，則不發起 API 請求
    if (!notification || notification.isRead) {
      return;
    }

    fetch(`api/notifications/${notificationId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isRead: true }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('通知已更新:', data);
        // 更新本地通知列表中的狀態
        notification.isRead = true;
      })
      .catch((error) => console.error('更新通知狀態時發生錯誤:', error));
  }

  function displayNotifications() {
    notificationListElement.innerHTML = '';
    // const notificationsToDisplay = notifications.slice(0, displayedCount + limit);
    if (notifications.length === 0) {
    // 創建一個提示用戶沒有通知的元素
      const noNotifications = document.createElement('div');
      noNotifications.className = 'no-notifications';
      noNotifications.textContent = '沒有更多消息';
      notificationListElement.appendChild(noNotifications);
    } else {
      const notificationsToDisplay = notifications
        .slice(0, displayedCount + limit)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      // console.log(notifications)
      notificationsToDisplay.forEach((notification) => {
        const item = document.createElement('div');
        item.className = `notification-item${notification.isRead ? ' read' : ''}`;
        item.dataset.id = notification.notification_id;

        const text = document.createElement('div');
        text.textContent = notification.text;

        const date = document.createElement('div');
        date.className = 'notification-date';
        date.textContent = formatDate(notification.createdAt);

        item.appendChild(text);
        item.appendChild(date);

        item.addEventListener('click', async () => {
        // 根據sender判斷屬性，來發送api
          const isJobPluginEnabled = checkJobPlugin();
          // console.log(notification.sender)
          if (notification.sender === 'Job_Pub' && notification.type === 'routine') {
            if (isJobPluginEnabled) {
              await openJobs(notifications, notification.notification_id);
            } else {
              alert('Job plugin is not enabled.');
            }
          }
          if (notification.sender === 'Job_Pub' && (notification.type === 'job_id_channel' || notification.type === 'company_name_channel')) {
          // console.log(isJobPluginEnabled)
            if (isJobPluginEnabled) {
              await openJobInfo(notifications, notification.notification_id);
            } else {
              alert('Job plugin is not enabled.');
            }
          }
          markAsRead(notification.notification_id);
          item.classList.add('read');
        });

        notificationListElement.appendChild(item);
      });
    }
    loadMoreButton.style.display = notifications.length > displayedCount + limit ? 'block' : 'none';
  }

  function fetchNotifications() {
  // 發送自身api（由後端發送）
    fetch('api/notifications', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        notifications = data.notifications.details;
        notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        displayedCount = 0;
        updateView(data.notifications.count);
        console.log(notifications);
        displayNotifications();
      })
      .catch((error) => console.error('獲取通知數量時發生錯誤:', error));
  }

  loadMoreButton.addEventListener('click', () => {
    displayedCount += limit;
    displayNotifications();
  });

  refreshButton.addEventListener('click', () => {
    // console.log('Current display state:', notificationListContainer.style.display);
    if (notificationListContainer.style.display === 'none' || notificationListContainer.style.display === '') {
      notificationListContainer.style.display = 'block';
      fetchNotifications();
    } else {
      notificationListContainer.style.display = 'none';
    }
  });

  socket.on('notificationUpdate', (data) => {
    console.log('Received notification update:', data);
    updateView(data.count);
    if (notificationListContainer.style.display === 'block') {
      fetchNotifications(); // 獲取最新的通知
    }
  });

  return {
    fetchNotificationCount,
  };
}

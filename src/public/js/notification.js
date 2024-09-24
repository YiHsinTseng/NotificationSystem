import initializeSocket from './socket.js';
import { initializePlugin } from './plugin.js';
import formatDate from './dateUtils.js';

// 通知相關元件
function getDomElement() {
  return {
    notificationCountElement: document.getElementById('notification-count'),
    notificationListContainer: document.getElementById('notification-list-container'),
    notificationListElement: document.getElementById('notification-list'),
    refreshButton: document.getElementById('refresh-button'),
    loadMoreButton: document.getElementById('load-more-button'),
  };
}

// 因為這些函數通常都基於notifications獲取或對於通知元件對象修改。故把那些變數綁定這些函式，但這樣不好測試
export function initializeNotification(token) {
  let notifications = [];
  const element = getDomElement();
  const { notificationCountElement, notificationListElement, loadMoreButton } = element;

  function updateView(count) {
    notificationCountElement.textContent = count;
  }

  // 根據限制來呈現通知數量
  // TODO API歸API，功能歸功能
  async function fetchNotifications(limit) {
    try {
      const response = await fetch('api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      notifications = data.notifications.details.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      updateView(data.notifications.count);
      displayNotifications(limit);
    } catch (error) {
      console.error(error, '獲取通知數量時發生錯誤:');
    }
  }

  // TODO API歸API，功能歸功能
  async function markAsRead(notificationId) {
    const notification = notifications.find((n) => n.notification_id === notificationId);
    if (!notification || notification.isRead) return;

    try {
      await fetch(`api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });
      notification.isRead = true;
    } catch (error) {
      console.error(error, '更新通知狀態時發生錯誤:');
    }
  }

  function renderNotificationItem(notification) {
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

    return item;
  }

  // 根據限制來呈現通知數量
  function displayNotifications(limit) {
    notificationListElement.innerHTML = '';
    if (notifications.length === 0) {
      const noNotifications = document.createElement('div');
      noNotifications.className = 'no-notifications';
      noNotifications.textContent = '沒有更多消息';
      notificationListElement.appendChild(noNotifications);
      return;
    }

    const fragment = document.createDocumentFragment();
    const notificationsToDisplay = notifications.slice(0, limit);

    notificationsToDisplay.forEach((notification) => {
      const item = renderNotificationItem(notification);
      fragment.appendChild(item);
    });

    notificationListElement.appendChild(fragment);
    loadMoreButton.style.display = notifications.length > limit ? 'block' : 'none';
  }

  return {
    fetchNotifications,
    markAsRead,
    displayNotifications,
    updateView,
    getNotifications: () => notifications, // 返回 notifications 的 getter，讓變數只在此作用域中
  };
}

export async function setupNotificationEventListeners(token, userPlugins) {
  let limit = 5;
  console.log('監聽器內', userPlugins);
  const {
    notificationListElement, refreshButton, loadMoreButton, notificationListContainer,
  } = getDomElement();

  const {
    fetchNotifications, markAsRead, displayNotifications, updateView, getNotifications,
  } = initializeNotification(token);// 將token注入函式內

  // 前置環境運行
  const socket = await initializeSocket(token);
  const { handleNotification } = await initializePlugin(token);// 是否有add

  // await fetchNotifications(limit);

  notificationListElement.addEventListener('click', async (event) => {
    const item = event.target.closest('.notification-item');
    if (!item) return;

    const notificationId = item.dataset.id;
    const notifications = getNotifications(); // 使用 getter 獲取 notifications
    const notification = notifications.find((n) => n.notification_id === notificationId);

    if (notification) {
      await handleNotification(notifications, notification, userPlugins);// 如何取的userPlugins
      await markAsRead(notification.notification_id);
      item.classList.add('read');
    }
  });

  loadMoreButton.addEventListener('click', () => {
    limit += limit;
    displayNotifications(limit);
  });

  refreshButton.addEventListener('click', () => {
    notificationListContainer.style.display = notificationListContainer.style.display === 'none' || notificationListContainer.style.display === '' ? 'block' : 'none';
    if (notificationListContainer.style.display === 'block') {
      fetchNotifications(limit);
    }
  });

  // TODO 改事件名 notificationCountUpdate
  socket.on('notificationUpdate', (data) => {
    console.log('應用一重整或收到通知就發送');
    updateView(data);
    if (notificationListContainer.style.display === 'block') {
      fetchNotifications(limit);
    }
  });
}

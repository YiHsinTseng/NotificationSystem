import initializeSocket from './socket.js';
import { handleNotification } from './plugin.js';
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

function updateView(notificationCountElement, count) {
  notificationCountElement.textContent = count;
}

// 根據限制來呈現通知數量
// TODO API歸API，功能歸功能
// 只負責API資料回傳
async function fetchNotifications(token) {
  try {
    const response = await fetch('api/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    return data.notifications.details.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error(error, '獲取通知數量時發生錯誤:');
  }
}

async function markAsRead(token, notificationId) {
  try {
    await fetch(`api/notifications/${notificationId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isRead: true }),
    });
  } catch (error) {
    console.error(error, '更新通知狀態時發生錯誤:');
  }
}

function renderNotificationItem(notification) {
  const notificationItem = document.createElement('div');
  notificationItem.className = `notification-item${notification.isRead ? ' read' : ''}`;
  notificationItem.dataset.id = notification.notification_id;

  const text = document.createElement('div');
  text.textContent = notification.text;

  const date = document.createElement('div');
  date.className = 'notification-date';
  date.textContent = formatDate(notification.createdAt);

  notificationItem.appendChild(text);
  notificationItem.appendChild(date);

  return notificationItem;
}

// 根據限制來呈現通知數量
export function displayNotifications(notificationListElement, loadMoreButton, notifications, limit) {
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
    const notificationItem = renderNotificationItem(notification);
    fragment.appendChild(notificationItem);
  });

  notificationListElement.appendChild(fragment);
  loadMoreButton.style.display = notifications.length > limit ? 'block' : 'none';
}

export async function setupNotificationEventListeners(token, userPlugins) {
  let limit = 5;
  let notifications = [];
  console.log('監聽器內', userPlugins);
  const {
    notificationListElement, refreshButton, loadMoreButton, notificationListContainer, notificationCountElement,
  } = getDomElement();

  // 前置環境運行
  const socket = await initializeSocket(token);

  async function updateNotifications() {
    notifications = await fetchNotifications(token);
    notificationCountElement.textContent = notifications.length;
    displayNotifications(notificationListElement, loadMoreButton, notifications, limit);
  }

  notificationListElement.addEventListener('click', async (event) => {
    const notificationItem = event.target.closest('.notification-item');
    if (!notificationItem) return;

    const notificationItemId = notificationItem.dataset.id;
    const notification = notifications.find((notification) => notification.notification_id === notificationItemId);

    if (notification) {
      await handleNotification(notification, userPlugins);// 如何取的userPlugins
      await markAsRead(token, notification.notification_id);
      notificationItem.classList.add('read');
    }
  });

  loadMoreButton.addEventListener('click', () => {
    limit += limit;
    displayNotifications(notificationListElement, loadMoreButton, notifications, limit);
  });

  refreshButton.addEventListener('click', () => {
    notificationListContainer.style.display = notificationListContainer.style.display === 'none' || notificationListContainer.style.display === '' ? 'block' : 'none';
    if (notificationListContainer.style.display === 'block') {
      updateNotifications();
    }
  });

  // TODO 改事件名 notificationCountUpdate
  socket.on('notificationUpdate', async (data) => {
    console.log('應用一重整或收到通知就發送');
    updateView(notificationCountElement, data);
    if (notificationListContainer.style.display === 'block') {
      await updateNotifications();
    }
  });

  await updateNotifications();
}

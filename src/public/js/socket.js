// socket.js

let socket;

export default function initializeSocket(token) {
  socket = io({
    auth: {
      token,
    },
  });

  socket.on('connect', () => {
    console.log('Socket.IO connected');
  });

  socket.on('connect_error', (err) => {
    if (err.message === 'Authentication error') {
      alert('認證錯誤，請重新登錄');
      window.location.href = '/login.html';
    } else {
      console.error('Socket.io 連接錯誤:', err);
    }
  });

  return socket;
}

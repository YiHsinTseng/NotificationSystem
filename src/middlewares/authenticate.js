const passport = require('../../config/passport');

const authenticateJwt = (req, res, next) => {
  const token = req.headers.authorization;

  // 檢查請求頭中是否包含 JWT
  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).send({ status: 'fail', message: 'Missing JWT' });
  }

  passport.authenticate('jwt', { session: false }, (err, user) => {
    // 如果出現錯誤，或者未找到用戶，返回 401 錯誤
    if (err || !user) {
      return res.status(401).send({ status: 'fail', message: 'Invalid JWT' });
    }

    // 如果身份驗證成功，將用戶資訊存儲在 req.user 中，並繼續處理下一個中間件或路由處理程序
    req.user = user;
    next();
  })(req, res, next);
};

const authenticateJwtSocket = (socket, next) => {
  const { token } = socket.handshake.auth;

  if (token) {
    // 在 WebSocket 上無法直接使用 passport.authenticate，手動處理 JWT 驗證
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err || !user) {
        console.error('Authentication error:', err || 'No user found');
        return next(new Error('Authentication error'));
      }
      // console.log(user);
      socket.user = user; // 存儲解碼的用戶信息
      next();
    })({ headers: { authorization: `Bearer ${token}` } }, null, next); // 模擬 req 物件
  } else {
    next(new Error('Authentication error'));
  }
};

const authenticateAdmin = (req, res, next) => {
  // 檢查用戶的電子郵件是否為 'admin123@gmail.com'
  if (req.user.email !== 'admin123@gmail.com') {
    return res.status(403).send({ status: 'fail', message: 'Access denied. You are not an admin.' });
  }
  next();
};

module.exports = { authenticateJwt, authenticateAdmin, authenticateJwtSocket };

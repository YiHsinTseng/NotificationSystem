const express = require('express');
const path = require('path');

function createExpressApp() {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../src/views')));// 公開瀏覽不受jwt驗證影響，index重導向login
  return app;
}

module.exports = createExpressApp;

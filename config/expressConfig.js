const express = require('express');
const path = require('path');

function createExpressApp() {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../src/public')));
  return app;
}

module.exports = createExpressApp;

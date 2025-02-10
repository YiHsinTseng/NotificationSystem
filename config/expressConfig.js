const express = require('express');
const path = require('path');
const cors = require("cors")
const {corsOptions} =require("./config")

function createExpressApp() {
  const app = express();

  app.use(cors(corsOptions))
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../src/public')));
  return app;
}

module.exports = createExpressApp;

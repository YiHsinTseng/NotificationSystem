const userRoute = require('./user');
const notifRoute = require('./notif');
const pluginRoute = require('./plugin');

function setupRoutes(app) {
  app.use('/', userRoute);
  app.use('/notifications', notifRoute);
  app.use('/', pluginRoute);
}

module.exports = setupRoutes;

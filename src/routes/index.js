const userRoute = require('./user');
const notifRoute = require('./notif');
const pluginRoute = require('./plugin');

function setupRoutes(app) {
  app.use('/api', userRoute);
  app.use('/api/notifications', notifRoute);
  app.use('/api', pluginRoute);
}

module.exports = setupRoutes;

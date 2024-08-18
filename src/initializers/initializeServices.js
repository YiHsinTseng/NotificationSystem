// const { NotificationRepository } = require('./src/repositories/notificationRepository');
// const MemoryStorage = require('./src/models/storages/memoryStorage');
const { NotificationAsyncRepository } = require('../models/repositories/notificationRepository');
const MongodbStorage = require('../models/storages/mongodbStorage');

function initializeServices() {
  const mongodbStorage = new MongodbStorage();
  const notificationRepository = new NotificationAsyncRepository(mongodbStorage);

  return {
    notificationRepository,
  };
}

module.exports = initializeServices;

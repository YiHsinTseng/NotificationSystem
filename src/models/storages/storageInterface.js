class StorageInterface {
  async getNotificationsCount() {
    throw new Error('Method not implemented');
  }

  async addNotification(notification) {
    throw new Error('Method not implemented');
  }

  async getAllNotifications() {
    throw new Error('Method not implemented');
  }
}

module.exports = StorageInterface;

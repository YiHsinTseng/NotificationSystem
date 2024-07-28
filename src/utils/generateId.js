const { v4: uuidv4 } = require('uuid');

function generateGroupId() {
  return uuidv4();
}

function generateItemId() {
  return uuidv4();
}

function generateUserId() {
  return uuidv4();
}

module.exports = { generateGroupId, generateItemId, generateUserId };

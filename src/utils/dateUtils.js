const moment = require('moment-timezone');

const TIMEZONE = 'Asia/Taipei';

/**
 * 獲取當前時間在指定時區
 * @returns {string} 格式化的時間字符串
 */
function getCurrentTimeInTimeZone() {
  return moment().tz(TIMEZONE).format('YYYY-MM-DDTHH:mm:ssZ');
}

/**
 * 獲取指定時區幾天前的時間
 * @param {number} num - 要獲取的天數
 * @returns {string} 格式化的時間字符串
 */
function getDaysAgoInTimeZone(num) {
  return moment().tz(TIMEZONE).subtract(num, 'days').format('YYYY-MM-DDTHH:mm:ssZ');
}

module.exports = {
  getCurrentTimeInTimeZone,
  getDaysAgoInTimeZone,
};

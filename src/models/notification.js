class Notification {
  constructor(id, text) {
    this.id = id; // 唯一標識符
    this.text = text; // 文字內容
    // this.sender = sender; // 寄件者
    // this.receiver = receiver; // 接收者
    this.timestamp = new Date(); // 消息生成時間
  }

  toJSON() {
    return {
      id: this.id,
      text: this.text,
      // sender: this.sender, // 寄件者
      // receiver: this.receiver, // 接收者
      timestamp: this.timestamp.toISOString(), // 將時間轉換為 ISO 格式字符串
    };
  }
}

module.exports = Notification;

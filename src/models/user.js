const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateUserId } = require('../utils/generateId');
const UserNotification = require('./userNotificationMongoose');
const UserPlugin = require('./userPluginMongoose');
const AppError = require('../utils/appError');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: generateUserId,
    alias: 'user_id',
  },
  email: {
    type: String,
    minlength: 6,
    maxlength: 50,
  },
  password: {
    type: String,
  },
  name: {
    type: String,
    minlength: 1,
    maxlength: 50,
  },
  public_id: { // 先有public_id就好，之後再考慮多plugin_id
    type: String,
    unique: true,
    default: generateUserId(), // 生成唯一的 public_id
  },
  googleID: {
    type: String,
  },
  thumbnail: {
    type: String,
  },

}, {
  toJSON: {
    transform(doc, ret) {
      const { _id, ...rest } = ret;
      const newRet = { user_id: _id, ...rest };
      return newRet;
    },
  },
});

userSchema.statics.findUserById = async function findUserById(user_id) {
  const user = await this.findById(user_id);
  if (!user) {
    throw new AppError(404, 'User not found or invalid user ID');
  }
  return user;
};

userSchema.statics.findUserByGoogleId = async function findUserByGoogleId(google_id) {
  const user = await this.findOne({ googleID: google_id });
  return user;
};

userSchema.statics.findUserByEmail = async function findUserByEmail(email) {
  const user = await this.findOne({ email });
  if (!user) {
    throw new AppError(404, 'User not found or invalid email');
  }
  return user;
};

// 實現 emailExists 靜態方法
userSchema.statics.emailExists = async function emailExists(email) {
  const user = await this.findOne({ email });
  return !!user;
};

// 實現 comparePassword 方法
userSchema.methods.comparePassword = function comparePassword(password) {
  console.log(password, this.password);
  return bcrypt.compare(password, this.password);
};

// 實現 generateAuthToken 方法
// userSchema.methods.generateAuthToken = function generateAuthToken() {
//   const tokenObject = {
//     user_id: this.user_id, email: this.email, version: 'v1.0',
//   };
//   const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET, { expiresIn: '7d' });
//   return token;
// };
userSchema.methods.generateAuthToken = function generateAuthToken() {
  const tokenObject = {
    user_id: this.public_id, // 使用 public_id 替代 user_id
    email: this.email,
    version: 'v1.0',
  };
  const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET, { expiresIn: '7d' });
  return token;
};

// 實現 createUser 實例方法
userSchema.methods.createUser = async function createUser() {
  await this.save();

  // 創建user時同時建通知表
  const userNotification = new UserNotification({
    _id: this._id,
    notifications: [],
  });
  await userNotification.save();

  // 創建user時同時建外掛表
  const userPlugin = new UserPlugin({
    _id: this._id,
    notifications: [],
  });
  await userPlugin.save();

  return { success: true, message: 'User signed up successfully.' };
};

userSchema.statics.getAllUsers = async function getAllUsers() {
  const users = await this.find().select('-__v');
  const userObjects = users.map((user) => {
    const userObject = user.toJSON();
    delete userObject.password;
    return userObject;
  });
  return { success: true, users: userObjects };
};

userSchema.statics.getUserInfo = async function getUserInfo(user_id) {
  const user = await this.findById(user_id).select('-__v');
  if (user) {
    // 將 user 物件轉換為一個普通的 JavaScript 物件
    const userObject = user.toJSON();
    // 刪除 password 屬性
    delete userObject.password;
    return { success: true, user: userObject };
  }
  return { success: false };
};

userSchema.methods.updateUserInfo = async function updateUserInfo(user_id) {
  // `this` refers to the instance of the model
  const user = this;

  // Update the user in the database
  await user.findOneAndUpdate(
    { _id: user_id }, // find a document with this filter
    user, // document to insert when nothing was found
    { new: true, upsert: true, runValidators: true }, // options
  );

  return { success: true, message: 'User info updated successfully' };
};

userSchema.methods.updateUserPassword = async function updateUserPassword(password) {
  // `this` refers to the instance of the model
  const user = this;

  // Hash the new password before saving
  user.password = password;

  await user.save();

  return { success: true, message: 'User password updated successfully' };
};

userSchema.statics.deleteUser = async function deleteUser(user_id) {
  // `this` refers to the model
  const User = this;

  // Find the user
  const user = await User.findById(user_id);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  // Remove all UserNotification objects that reference this user
  await mongoose.model('UserNotification').deleteMany({ _id: user._id });

  // Delete the user
  await User.deleteOne({ _id: user_id });

  return { success: true, message: 'User deleted successfully' };
};

// 實現 hashPassword 中間件
userSchema.pre('save', async function saveUser(next) {
  // Only hash the password if it has been modified (or is new) and password exists
  if (this.password && (this.isNew || this.isModified('password'))) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (!this.public_id) {
    this.public_id = generateUserId();
  }
  next();
});

userSchema.statics.findUserByPublicId = async function (public_id) {
  try {
    const user = await this.findOne({ public_id });
    return user || null;
  } catch (error) {
    console.error('Error finding user by public_id:', error);
    throw error;
  }
};

userSchema.statics.findPublicIdByUserId = async function (user_id) {
  try {
    const user = await this.findById(user_id, 'public_id'); // 只返回 public_id 字段
    if (user) {
      return user.public_id;
    }
    return null;
  } catch (error) {
    console.error('Error finding public_id by user_id:', error);
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;

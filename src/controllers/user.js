const User = require('../models/user');

const AppError = require('../utils/appError');

const register = async (req, res, next) => {
  try {
    // 確認信箱是否被註冊過
    const emailExist = await User.emailExists(req.body.email);
    if (emailExist) throw new AppError( 409, 'This email has already been registered');
    const isAdmin = (req.body.email === 'admin123@gmail.com');

    // 製作新用戶
    const {
      email, password,
    } = req.body;

    const newUser = new User({ email, password });

    const token = await newUser.generateAuthToken();
    const result = await newUser.createUser();
    if (result.success) {
      return res.status(201).json({
        status: 'success', message: result.message, token, isAdmin, redirectTo: '/index.html',
      });
    }
    throw new AppError( 400, 'Failed to register');
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    // 確認信箱是否被註冊過
    const foundUser = await User.findUserByEmail(req.body.email);
    const isAdmin = (foundUser.email === 'admin123@gmail.com');
    if (!foundUser) {
      throw new AppError( 401, 'Unable to find user. Please confirm if the email is correct');
    }

    const isMatch = await foundUser.comparePassword(req.body.password);
    if (isMatch) {
      const token = await foundUser.generateAuthToken();
      // console.log(token);
      const result = res.json({
        status: 'success',
        message: 'User signed in successfully',
        token,
        isAdmin,
      });
      return result;
    }
    throw new AppError( 401, 'Incorrect password');
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const result = await User.getAllUsers();
    if (result.success) {
      return res.status(200).json(result.users);
    }
    throw new AppError( 400, 'Cannot get users');
  } catch (error) {
    next(error);
  }
};

const getUserInfo = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const result = await User.getUserInfo(user_id);
    if (result.success) {
      return res.status(200).json(result.user);
    }
    throw new AppError( 400, 'Cannot get users');
  } catch (error) {
    next(error);
  }
};

const updateUserInfo = async (req, res, next) => {
  try {
    const { user_id } = req.user;

    const userToUpdate = await User.findUserById(user_id);

    const { email, password } = req.body;

    // Check that only one of email, password is present
    const numProps = [email, password].filter((prop) => prop !== undefined).length;
    if (numProps !== 1) {
      throw new AppError( 400, 'Invalid request body, only one of email or password should be present');
    }

    let result;

    if (user_id && email) {
      // 確認信箱是否被註冊過
      const emailExist = await User.emailExists(email);
      if (emailExist) throw new AppError( 409, 'This email has already been registered');
      userToUpdate.email = email;
      result = await userToUpdate.updateUserInfo(user_id);
    } else if (user_id && password) {
      result = await userToUpdate.updateUserPassword(password);
    } else {
      throw new AppError( 400, 'Invalid request body');
    }

    if (result.success) {
      return res.status(200).json({ status: 'success', message: result.message });
    }
    throw new AppError( 400, 'User failed to update');
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { user_id } = req.user;

    const result = await User.deleteUser(user_id, next);
    if (result.success) {
      return res.status(204).header('X-Message', 'User removed successfully').send();
    }
    throw new AppError( 400, 'User failed to delete');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register, login, getAllUsers, getUserInfo, updateUserInfo, deleteUser,
};

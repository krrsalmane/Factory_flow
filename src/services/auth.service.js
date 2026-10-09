const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');

exports.login = async (email, password) => {
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new AppError('Email and password are required', 400);
  }

  const user = await userRepository.findByEmail(email);


  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
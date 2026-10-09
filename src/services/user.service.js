const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');

exports.createUser = async ({ name, email, password, role }) => {
  const fields = [name, email, password];
  if (fields.some((f) => typeof f !== 'string' || !f.trim())) {
    throw new AppError('Name, email and password are required', 400);
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new AppError('Invalid email', 400);
  if (password.length < 6) throw new AppError('Password must have at least 6 characters', 400);
  if (!['ADMIN', 'OPERATOR'].includes(role)) throw new AppError('Role must be ADMIN or OPERATOR', 400);

  if (await userRepository.findByEmail(email)) throw new AppError('Email already used', 409);

  const user = await userRepository.create({
    name,
    email,
    password: await bcrypt.hash(password, 10), // never store the clear password
    role,
  });

  const { password: _hash, ...safeUser } = user.toObject(); // remove the hash from the response
  return safeUser;
};

exports.getProfile = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) throw new AppError('User not found', 404);
  return user;
};
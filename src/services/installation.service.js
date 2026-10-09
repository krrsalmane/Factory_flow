const mongoose = require('mongoose');
const installationRepository = require('../repositories/installation.repository');
const userService = require('./user.service');
const AppError = require('../utils/AppError');

exports.getStatus = async () => {
  const installation = await installationRepository.find();
  return { installed: !!installation };
};

exports.install = async ({ name, email, password }) => {
  if ((await exports.getStatus()).installed) {
    throw new AppError('The application is already installed', 409);
  }

  // Transaction: the admin and the installation state are saved together,
  // or nothing is saved at all if something fails.
  const session = await mongoose.startSession();
  try {
    let admin;
    await session.withTransaction(async () => {
      admin = await userService.createUser({ name, email, password, role: 'ADMIN' }, session);
      await installationRepository.create({ admin: admin._id }, session);
    });
    return admin;
  } finally {
    session.endSession();
  }
};
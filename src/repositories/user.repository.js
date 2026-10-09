const User = require('../models/user.model');

// '+password' because the password is hidden by default in the model
exports.findByEmail = (email) =>
  User.findOne({ email: email.toLowerCase().trim() }).select('+password');

exports.findById = (id) => User.findById(id);

// session is optional: it is only used inside a transaction
exports.create = async (data, session) => {
  const [user] = await User.create([data], { session });
  return user;
};
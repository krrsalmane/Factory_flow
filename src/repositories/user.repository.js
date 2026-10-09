const User = require('../models/user.model');


exports.findByEmail = (email) =>
  User.findOne({ email: email.toLowerCase().trim() }).select('+password');

exports.findById = (id) => User.findById(id);

exports.create = (data) => User.create(data);
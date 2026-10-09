const Installation = require('../models/installation.model');

exports.find = () => Installation.findOne();

exports.create = async (data, session) => {
  const [installation] = await Installation.create([data], { session });
  return installation;
};
const Material = require('../models/material.model');

exports.create = (data) => Material.create(data);

exports.findAll = () => Material.find().sort('name');

exports.findById = (id) => Material.findById(id);

exports.findByReference = (reference) => Material.findOne({ reference });

exports.update = (id, data) =>
  Material.findByIdAndUpdate(id, data, { new: true, runValidators: true });

// Materials whose stock is at or below the alert threshold
exports.findLowStock = () =>
  Material.find({ $expr: { $lte: ['$quantity', '$reorderPoint'] } }).sort('name');

// Adds (or removes, with a negative number) stock
exports.addStock = (id, quantity, session) =>
  Material.findByIdAndUpdate(id, { $inc: { quantity } }, { new: true, session });

exports.findByIds = (ids) => Material.find({ _id: { $in: ids } });
const Order = require('../models/order.model');

const populateOrder = (query) => query
  .populate('product', 'reference name')
  .populate('operator', 'name email')
  .populate('createdBy', 'name email')
  .populate('composition.material', 'reference name unit');

exports.create = (data) => Order.create(data);
exports.findAll = () => populateOrder(Order.find().sort('-createdAt'));
exports.findById = (id) => populateOrder(Order.findById(id));
exports.update = (id, changes) => populateOrder(
  Order.findByIdAndUpdate(id, changes, { new: true, runValidators: true })
);

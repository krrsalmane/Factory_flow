
const Order = require('../models/order.model');

// Shows names instead of only ids
const withDetails = (query) =>
  query
    .populate('product', 'reference name')
    .populate('operator', 'name email')
    .populate('createdBy', 'name email')
    .populate('composition.material', 'reference name unit');

exports.create = (data) => Order.create(data);

exports.findById = (id) => withDetails(Order.findById(id));

exports.findAll = (filter, page, limit) =>
  withDetails(Order.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit));

exports.count = (filter) => Order.countDocuments(filter);

exports.update = (id, data) =>
  withDetails(Order.findByIdAndUpdate(id, data, { new: true, runValidators: true }));

// Without populate: composition keeps the material ids, operator keeps the user id
exports.findRawById = (id) => Order.findById(id);

exports.findMany = (filter, sort) => withDetails(Order.find(filter).sort(sort));

// Changes PLANNED -> IN_PROGRESS. Returns null if the order is not PLANNED any more.
exports.startOrder = (id, session) =>
  Order.findOneAndUpdate(
    { _id: id, status: 'PLANNED' },
    { status: 'IN_PROGRESS', startedAt: new Date() },
    { new: true, session }
  );

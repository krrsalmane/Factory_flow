const mongoose = require('mongoose');
const orderRepository = require('../repositories/order.repository');
const AppError = require('../utils/AppError');

const transitions = {
  PLANNED: ['IN_PROGRESS', 'CANCELED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELED'],
  COMPLETED: [],
  CANCELED: [],
};

exports.updateOrderStatus = async (id, status) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid order id', 400);
  if (!Object.prototype.hasOwnProperty.call(transitions, status)) {
    throw new AppError('Invalid order status', 400);
  }

  const order = await orderRepository.findById(id);
  if (!order) throw new AppError('Order not found', 404);
  if (!transitions[order.status].includes(status)) {
    throw new AppError(`Cannot change order from ${order.status} to ${status}`, 400);
  }

  const changes = { status };
  if (status === 'IN_PROGRESS') changes.startedAt = new Date();
  if (status === 'COMPLETED') changes.completedAt = new Date();
  if (status === 'CANCELED') changes.canceledAt = new Date();
  return orderRepository.update(id, changes);
};

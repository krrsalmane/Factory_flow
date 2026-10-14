const mongoose = require('mongoose');
const orderRepository = require('../repositories/order.repository');
const materialRepository = require('../repositories/material.repository');
const stockMovementRepository = require('../repositories/stockMovement.repository');
const AppError = require('../utils/AppError');

const STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'];

// Returns the order only if it exists AND is assigned to this operator
const getMyOrderOrFail = async (orderId, operatorId) => {
  const order = await orderRepository.findRawById(orderId);
  if (!order || String(order.operator) !== operatorId) {
    throw new AppError('Order not found', 404);
  }
  return order;
};

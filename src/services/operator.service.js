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

// Quantity needed of a material = quantity per unit x quantity to manufacture
const calculateNeeded = (line, order) => Number((line.quantity * order.quantity).toFixed(6));

exports.getMyOrders = (operatorId, status) => {
  const filter = { operator: operatorId };

  if (status !== undefined) {
    if (!STATUSES.includes(status)) {
      throw new AppError('Status must be PLANNED, IN_PROGRESS, COMPLETED or CANCELED', 400);
    }
    filter.status = status;
  }

  return orderRepository.findMany(filter, '-createdAt');
};

exports.getMyOrder = async (orderId, operatorId) => {
  await getMyOrderOrFail(orderId, operatorId);
  return orderRepository.findById(orderId);
};

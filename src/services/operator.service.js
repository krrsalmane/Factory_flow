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

exports.getMyHistory = (operatorId) =>
  orderRepository.findMany({ operator: operatorId, status: 'COMPLETED' }, '-completedAt');

exports.startOrder = async (orderId, operatorId) => {
  const order = await getMyOrderOrFail(orderId, operatorId);

  // 1. Only a planned order can be started (a second start is refused here)
  if (order.status !== 'PLANNED') {
    throw new AppError('Only a planned order can be started', 409);
  }

  // 2. Check the stock BEFORE changing anything, and list what is missing
  const missing = [];
  for (const line of order.composition) {
    const material = await materialRepository.findById(line.material);
    const needed = calculateNeeded(line, order);
    if (material.quantity < needed) {
      missing.push(`${material.name} (needed ${needed}, available ${material.quantity})`);
    }
  }
  if (missing.length > 0) {
    throw new AppError('Not enough stock: ' + missing.join(', '), 409);
  }

  // 3. Transaction: status + stock + movements are saved together, or nothing is saved
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // The order must still be planned (protects against two starts at the same time)
      const started = await orderRepository.startOrder(orderId, session);
      if (!started) throw new AppError('Only a planned order can be started', 409);

      for (const line of order.composition) {
        const needed = calculateNeeded(line, order);

        // Removes the stock only if there is still enough
        const material = await materialRepository.deductStock(line.material, needed, session);
        if (!material) throw new AppError('Not enough stock, the order was not started', 409);

        await stockMovementRepository.create(
          { material: line.material, type: 'OUT', quantity: needed, order: orderId, user: operatorId },
          session
        );
      }
    });
  } finally {
    session.endSession();
  }

  return orderRepository.findById(orderId);
};

exports.completeOrder = async (orderId, operatorId) => {
  const order = await getMyOrderOrFail(orderId, operatorId);

  if (order.status !== 'IN_PROGRESS') {
    throw new AppError('Only an order in progress can be completed', 409);
  }

  return orderRepository.update(orderId, { status: 'COMPLETED', completedAt: new Date() });
};
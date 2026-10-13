const mongoose = require('mongoose');
const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');
const userRepository = require('../repositories/user.repository');
const productionService = require('./production.service');
const AppError = require('../utils/AppError');

const validId = (id) => mongoose.isValidObjectId(id);

const getOrderOrFail = async (id) => {
  if (!validId(id)) throw new AppError('Invalid order id', 400);
  const order = await orderRepository.findById(id);
  if (!order) throw new AppError('Order not found', 404);
  return order;
};

exports.createOrder = async ({ product: productId, quantity, operator }, createdBy) => {
  if (!validId(productId)) throw new AppError('A valid product id is required', 400);
  if (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity <= 0) {
    throw new AppError('Order quantity must be a number greater than 0', 400);
  }
  if (!validId(operator)) throw new AppError('A valid operator id is required', 400);

  const [product, assignedOperator] = await Promise.all([
    productRepository.findById(productId),
    userRepository.findById(operator),
  ]);
  if (!product) throw new AppError('Product not found', 404);
  if (!assignedOperator || assignedOperator.role !== 'OPERATOR') {
    throw new AppError('Assigned user must be an operator', 400);
  }

  // Save a snapshot so later product edits do not rewrite an existing order's BOM.
  const composition = product.composition.map((line) => ({
    material: line.material._id || line.material,
    quantity: line.quantity,
  }));

  return orderRepository.create({
    product: productId,
    quantity,
    composition,
    operator,
    createdBy,
  });
};

exports.getOrders = () => orderRepository.findAll();
exports.getOrder = (id) => getOrderOrFail(id);

exports.updateOrderStatus = (id, status) => productionService.updateOrderStatus(id, status);

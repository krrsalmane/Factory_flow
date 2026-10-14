const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');

const STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'];

const getOrderOrFail = async (id) => {
  const order = await orderRepository.findById(id);
  if (!order) throw new AppError('Order not found', 404);
  return order;
};

const checkQuantity = (quantity) => {
  if (typeof quantity !== 'number' || quantity <= 0) {
    throw new AppError('Quantity must be a number greater than 0', 400);
  }
};

// The user must exist and must be an operator
const checkOperator = async (operatorId) => {
  if (typeof operatorId !== 'string') throw new AppError('Operator id is required', 400);
  const operator = await userRepository.findById(operatorId);
  if (!operator || operator.role !== 'OPERATOR') {
    throw new AppError('Operator does not exist', 400);
  }
};

// Only a planned order can be modified or canceled
const checkPlanned = (order) => {
  if (order.status !== 'PLANNED') {
    throw new AppError('Only a planned order can be modified or canceled', 409);
  }
};

exports.createOrder = async (data, adminId) => {
  checkQuantity(data.quantity);

  if (typeof data.product !== 'string') throw new AppError('Product id is required', 400);
  const product = await productRepository.findRawById(data.product);
  if (!product) throw new AppError('Product does not exist', 400);

  await checkOperator(data.operator);

  // Copy of the composition: the order keeps it even if the product changes later
  const composition = [];
  for (const line of product.composition) {
    composition.push({ material: line.material, quantity: line.quantity });
  }

  const order = await orderRepository.create({
    product: product._id,
    quantity: data.quantity,
    composition: composition,
    operator: data.operator,
    createdBy: adminId,
  });

  return orderRepository.findById(order._id);
};

exports.getOrders = async (query) => {
  const filter = {};

  if (query.status !== undefined) {
    if (!STATUSES.includes(query.status)) {
      throw new AppError('Status must be PLANNED, IN_PROGRESS, COMPLETED or CANCELED', 400);
    }
    filter.status = query.status;
  }

  if (query.product !== undefined) {
    if (typeof query.product !== 'string') throw new AppError('Invalid product filter', 400);
    filter.product = query.product;
  }

  // Period: filters on the creation date (from / to)
  if (query.from !== undefined || query.to !== undefined) {
    filter.createdAt = {};

    if (query.from !== undefined) {
      const from = new Date(query.from);
      if (isNaN(from)) throw new AppError('Invalid "from" date', 400);
      filter.createdAt.$gte = from;
    }

    if (query.to !== undefined) {
      const to = new Date(query.to);
      if (isNaN(to)) throw new AppError('Invalid "to" date', 400);
      if (query.to.length === 10) to.setUTCHours(23, 59, 59, 999); // "2026-10-20" = whole day
      filter.createdAt.$lte = to;
    }
  }

  // Pagination: page 1 and 10 per page by default (100 max)
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));

  const total = await orderRepository.count(filter);
  const orders = await orderRepository.findAll(filter, page, limit);

  return { total, page, limit, totalPages: Math.ceil(total / limit), orders };
};

exports.getOrder = (id) => getOrderOrFail(id);

exports.updateOrder = async (id, data) => {
  if (data.status !== undefined) {
    throw new AppError('The status cannot be changed here (use the cancel route to cancel)', 400);
  }
  if (data.product !== undefined) {
    throw new AppError('The product of an order cannot be changed', 400);
  }

  const order = await getOrderOrFail(id);
  checkPlanned(order);

  const changes = {};

  if (data.quantity !== undefined) {
    checkQuantity(data.quantity);
    changes.quantity = data.quantity;
  }

  if (data.operator !== undefined) {
    await checkOperator(data.operator);
    changes.operator = data.operator;
  }

  if (changes.quantity === undefined && changes.operator === undefined) {
    throw new AppError('Nothing to update (quantity or operator)', 400);
  }

  return orderRepository.update(id, changes);
};

exports.cancelOrder = async (id) => {
  const order = await getOrderOrFail(id);
  checkPlanned(order);

  return orderRepository.update(id, { status: 'CANCELED', canceledAt: new Date() });
};
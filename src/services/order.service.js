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

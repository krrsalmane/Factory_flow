const orderService = require('../services/order.service');
const catchAsync = require('../utils/catchAsync');

exports.create = catchAsync(async (req, res) => {
  res.status(201).json(await orderService.createOrder(req.body, req.user.id));
});

exports.getAll = catchAsync(async (req, res) => {
  res.json(await orderService.getOrders());
});

exports.getOne = catchAsync(async (req, res) => {
  res.json(await orderService.getOrder(req.params.id));
});

exports.updateStatus = catchAsync(async (req, res) => {
  res.json(await orderService.updateOrderStatus(req.params.id, req.body.status));
});

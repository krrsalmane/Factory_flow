const orderService = require('../services/order.service');
const catchAsync = require('../utils/catchAsync');

exports.create = catchAsync(async (req, res) => {
  res.status(201).json(await orderService.createOrder(req.body, req.user.id));
});

exports.getAll = catchAsync(async (req, res) => {
  res.json(await orderService.getOrders(req.query));
});

exports.getOne = catchAsync(async (req, res) => {
  res.json(await orderService.getOrder(req.params.id));
});

exports.update = catchAsync(async (req, res) => {
  res.json(await orderService.updateOrder(req.params.id, req.body));
});

exports.cancel = catchAsync(async (req, res) => {
  res.json(await orderService.cancelOrder(req.params.id));
});
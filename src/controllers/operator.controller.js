const operatorService = require('../services/operator.service');
const catchAsync = require('../utils/catchAsync');

exports.getMyOrders = catchAsync(async (req, res) => {
  res.json(await operatorService.getMyOrders(req.user.id, req.query.status));
});

exports.getMyHistory = catchAsync(async (req, res) => {
  res.json(await operatorService.getMyHistory(req.user.id));
});

exports.getMyOrder = catchAsync(async (req, res) => {
  res.json(await operatorService.getMyOrder(req.params.id, req.user.id));
});

exports.startOrder = catchAsync(async (req, res) => {
  res.json(await operatorService.startOrder(req.params.id, req.user.id));
});

exports.completeOrder = catchAsync(async (req, res) => {
  res.json(await operatorService.completeOrder(req.params.id, req.user.id));
});
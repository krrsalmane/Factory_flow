const operatorService = require('../services/operator.service');
const catchAsync = require('../utils/catchAsync');

exports.getMyOrders = catchAsync(async (req, res) => {
  res.json(await operatorService.getMyOrders(req.user.id, req.query.status));
});

exports.getMyHistory = catchAsync(async (req, res) => {
  res.json(await operatorService.getMyHistory(req.user.id));
});

const productService = require('../services/product.service');
const catchAsync = require('../utils/catchAsync');

exports.create = catchAsync(async (req, res) => {
  res.status(201).json(await productService.createProduct(req.body));
});

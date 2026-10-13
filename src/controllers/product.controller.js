const productService = require('../services/product.service');
const catchAsync = require('../utils/catchAsync');

exports.create = catchAsync(async (req, res) => {
  res.status(201).json(await productService.createProduct(req.body));
});

exports.getAll = catchAsync(async (req, res) => {
  res.json(await productService.getProducts());
});

exports.getOne = catchAsync(async (req, res) => {
  res.json(await productService.getProduct(req.params.id));
});

exports.update = catchAsync(async (req, res) => {
  res.json(await productService.updateProduct(req.params.id, req.body));
});
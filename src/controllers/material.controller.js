const materialService = require('../services/material.service');
const catchAsync = require('../utils/catchAsync');

exports.create = catchAsync(async (req, res) => {
  res.status(201).json(await materialService.createMaterial(req.body));
});

exports.getAll = catchAsync(async (req, res) => {
  res.json(await materialService.getMaterials());
});

exports.getOne = catchAsync(async (req, res) => {
  res.json(await materialService.getMaterial(req.params.id));
});

exports.update = catchAsync(async (req, res) => {
  res.json(await materialService.updateMaterial(req.params.id, req.body));
});

exports.addEntry = catchAsync(async (req, res) => {
  const material = await materialService.addStockEntry(req.params.id, req.body.quantity, req.user.id);
  res.status(201).json(material);
});

exports.getMovements = catchAsync(async (req, res) => {
  res.json(await materialService.getMovements(req.params.id));
});

exports.getAlerts = catchAsync(async (req, res) => {
  res.json(await materialService.getAlerts());
});
const mongoose = require('mongoose');
const materialRepository = require('../repositories/material.repository');
const stockMovementRepository = require('../repositories/stockMovement.repository');
const AppError = require('../utils/AppError');

const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);
const isText = (v) => typeof v === 'string' && v.trim() !== '';

const getMaterialOrFail = async (id) => {
  const material = await materialRepository.findById(id);
  if (!material) throw new AppError('Material not found', 404);
  return material;
};

exports.createMaterial = async ({ reference, name, unit, quantity = 0, reorderPoint = 0 }) => {
  if (![reference, name, unit].every(isText)) {
    throw new AppError('Reference, name and unit are required', 400);
  }
  if (!isNumber(quantity) || quantity < 0) throw new AppError('Quantity must be a number >= 0', 400);
  if (!isNumber(reorderPoint) || reorderPoint < 0) throw new AppError('Reorder point must be a number >= 0', 400);

  if (await materialRepository.findByReference(reference.trim())) {
    throw new AppError('Material reference already used', 409);
  }

  return materialRepository.create({ reference, name, unit, quantity, reorderPoint });
};

exports.getMaterials = () => materialRepository.findAll();

exports.getMaterial = (id) => getMaterialOrFail(id);

exports.updateMaterial = async (id, data) => {
  if ('quantity' in data || 'reference' in data) {
    throw new AppError('Reference cannot change and stock only changes through stock entries', 400);
  }
  await getMaterialOrFail(id);

  const changes = {};
  if ('name' in data) {
    if (!isText(data.name)) throw new AppError('Name cannot be empty', 400);
    changes.name = data.name;
  }
  if ('unit' in data) {
    if (!isText(data.unit)) throw new AppError('Unit cannot be empty', 400);
    changes.unit = data.unit;
  }
  if ('reorderPoint' in data) {
    if (!isNumber(data.reorderPoint) || data.reorderPoint < 0) {
      throw new AppError('Reorder point must be a number >= 0', 400);
    }
    changes.reorderPoint = data.reorderPoint;
  }
  if (Object.keys(changes).length === 0) {
    throw new AppError('Nothing to update (name, unit or reorderPoint)', 400);
  }

  return materialRepository.update(id, changes);
};

exports.addStockEntry = async (id, quantity, userId) => {
  if (!isNumber(quantity) || quantity <= 0) {
    throw new AppError('Entry quantity must be a number greater than 0', 400);
  }
  await getMaterialOrFail(id);

  // Transaction: the new stock and its movement are saved together, or not at all
  const session = await mongoose.startSession();
  try {
    let material;
    await session.withTransaction(async () => {
      material = await materialRepository.addStock(id, quantity, session);
      await stockMovementRepository.create({ material: id, type: 'IN', quantity, user: userId }, session);
    });
    return material;
  } finally {
    session.endSession();
  }
};

exports.getMovements = async (id) => {
  await getMaterialOrFail(id);
  return stockMovementRepository.findByMaterial(id);
};

exports.getAlerts = () => materialRepository.findLowStock();
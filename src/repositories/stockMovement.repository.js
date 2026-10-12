const StockMovement = require('../models/stockMovement.model');

exports.create = async (data, session) => {
  const [movement] = await StockMovement.create([data], { session });
  return movement;
};

exports.findByMaterial = (materialId) =>
  StockMovement.find({ material: materialId })
    .sort('-createdAt')
    .populate('user', 'name email');
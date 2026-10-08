const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
    type: { type: String, enum: ['IN', 'OUT'], required: true },
    quantity: {
      type: Number,
      required: true,
      validate: { validator: (v) => v > 0, message: 'Movement quantity must be strictly positive' },
    },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StockMovement', stockMovementSchema);
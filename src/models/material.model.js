const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    reference: { type: String, required: [true, 'Reference is required'], unique: true, trim: true },
    name: { type: String, required: [true, 'Name is required'], trim: true },
    unit: { type: String, required: [true, 'Unit is required'], trim: true },
    quantity: { type: Number, default: 0, min: [0, 'Quantity cannot be negative'] },
    reorderPoint: { type: Number, default: 0, min: [0, 'Reorder point cannot be negative'] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', materialSchema);
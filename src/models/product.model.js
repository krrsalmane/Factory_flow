const mongoose = require('mongoose');

const compositionLineSchema = new mongoose.Schema(
  {
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
    quantity: {
      type: Number,
      required: true,
      validate: { validator: (v) => v > 0, message: 'Composition quantity must be strictly positive' },
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    reference: { type: String, required: [true, 'Reference is required'], unique: true, trim: true },
    name: { type: String, required: [true, 'Name is required'], trim: true },
    composition: {
      type: [compositionLineSchema],
      validate: [
        { validator: (lines) => lines.length >= 1, message: 'A product needs at least one material' },
        {
          validator: (lines) => new Set(lines.map((l) => String(l.material))).size === lines.length,
          message: 'A material can appear only once in the composition',
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
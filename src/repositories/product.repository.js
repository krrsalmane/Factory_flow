const Product = require('../models/product.model');

// Shows the material name/reference/unit instead of only its id
const withMaterials = (query) => query.populate('composition.material', 'reference name unit');

exports.create = (data) => Product.create(data);

exports.findAll = () => withMaterials(Product.find().sort('name'));

exports.findById = (id) => withMaterials(Product.findById(id));

exports.findByReference = (reference) => Product.findOne({ reference });

exports.update = (id, data) =>
  withMaterials(Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }));
const Product = require('../models/product.model');

// Shows the material name/reference/unit instead of only its id
const withMaterials = (query) => query.populate('composition.material', 'reference name unit');

exports.create = (data) => Product.create(data);

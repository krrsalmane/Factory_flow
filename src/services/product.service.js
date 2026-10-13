const productRepository = require('../repositories/product.repository');
const materialRepository = require('../repositories/material.repository');
const AppError = require('../utils/AppError');

// true if the value is a text that is not empty
const isText = (value) => typeof value === 'string' && value.trim() !== '';

// Checks the composition. It throws an error if something is wrong.
const checkComposition = async (composition) => {
  // 1. It must be a list with at least one line
  if (!Array.isArray(composition) || composition.length === 0) {
    throw new AppError('A product needs at least one material', 400);
  }

  const materialIds = [];

  for (const line of composition) {
    // 2. Each line needs a material id and a quantity greater than 0
    if (!line || typeof line.material !== 'string') {
      throw new AppError('Each line needs a material id', 400);
    }
    if (typeof line.quantity !== 'number' || line.quantity <= 0) {
      throw new AppError('Each quantity must be a number greater than 0', 400);
    }

    // 3. A material can appear only once
    if (materialIds.includes(line.material)) {
      throw new AppError('A material can appear only once in the composition', 400);
    }
    materialIds.push(line.material);
  }

  // 4. All the materials must exist in the database
  const foundMaterials = await materialRepository.findByIds(materialIds);
  if (foundMaterials.length !== materialIds.length) {
    throw new AppError('One or more materials do not exist', 400);
  }
};

const getProductOrFail = async (id) => {
  const product = await productRepository.findById(id);
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

exports.createProduct = async (data) => {
  if (!isText(data.reference) || !isText(data.name)) {
    throw new AppError('Reference and name are required', 400);
  }

  await checkComposition(data.composition);

  const existing = await productRepository.findByReference(data.reference.trim());
  if (existing) throw new AppError('Product reference already used', 409);

  const product = await productRepository.create({
    reference: data.reference,
    name: data.name,
    composition: data.composition,
  });

  return productRepository.findById(product._id);
};

exports.getProducts = () => productRepository.findAll();

exports.getProduct = (id) => getProductOrFail(id);

exports.updateProduct = async (id, data) => {
  if (data.reference !== undefined) {
    throw new AppError('Product reference cannot be modified', 400);
  }

  await getProductOrFail(id);

  const changes = {};

  if (data.name !== undefined) {
    if (!isText(data.name)) throw new AppError('Name cannot be empty', 400);
    changes.name = data.name;
  }

  if (data.composition !== undefined) {
    await checkComposition(data.composition);
    changes.composition = data.composition;
  }

  if (changes.name === undefined && changes.composition === undefined) {
    throw new AppError('Nothing to update (name or composition)', 400);
  }

  return productRepository.update(id, changes);
};
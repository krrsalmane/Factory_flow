const productService = require('../../src/services/product.service');
const productRepository = require('../../src/repositories/product.repository');
const materialRepository = require('../../src/repositories/material.repository');

jest.mock('../../src/repositories/product.repository');
jest.mock('../../src/repositories/material.repository');

const composition = [
  { material: 'm1', quantity: 2 },
  { material: 'm2', quantity: 3 },
];

beforeEach(() => {
  jest.resetAllMocks();
  // By default: the 2 materials exist and the reference is free
  materialRepository.findByIds.mockResolvedValue([{ _id: 'm1' }, { _id: 'm2' }]);
  productRepository.findByReference.mockResolvedValue(null);
  productRepository.create.mockResolvedValue({ _id: 'p1' });
  productRepository.findById.mockResolvedValue({ _id: 'p1', name: 'Table' });
});

it('creates a product with its composition', async () => {
  const result = await productService.createProduct({ reference: 'PROD-001', name: 'Table', composition });

  expect(result.name).toBe('Table');
  expect(productRepository.create).toHaveBeenCalledTimes(1);
});

it('refuses a product without material (400)', async () => {
  await expect(
    productService.createProduct({ reference: 'PROD-001', name: 'Table', composition: [] })
  ).rejects.toMatchObject({ status: 400 });
});

it('refuses the same material twice (400)', async () => {
  const twice = [{ material: 'm1', quantity: 1 }, { material: 'm1', quantity: 2 }];

  await expect(
    productService.createProduct({ reference: 'PROD-001', name: 'Table', composition: twice })
  ).rejects.toMatchObject({ status: 400 });
});

it('refuses a quantity of 0 (400)', async () => {
  const zero = [{ material: 'm1', quantity: 0 }];

  await expect(
    productService.createProduct({ reference: 'PROD-001', name: 'Table', composition: zero })
  ).rejects.toMatchObject({ status: 400 });
});
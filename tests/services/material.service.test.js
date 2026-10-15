const materialService = require('../../src/services/material.service');
const materialRepository = require('../../src/repositories/material.repository');
const stockMovementRepository = require('../../src/repositories/stockMovement.repository');
const fakeTransaction = require('../helpers/fakeTransaction');

jest.mock('../../src/repositories/material.repository');
jest.mock('../../src/repositories/stockMovement.repository');

beforeEach(() => {
  jest.resetAllMocks();
  fakeTransaction();
});

it('creates a material', async () => {
  materialRepository.findByReference.mockResolvedValue(null); // reference is free
  materialRepository.create.mockResolvedValue({ _id: 'm1' });

  const result = await materialService.createMaterial({ reference: 'MAT-001', name: 'Wood', unit: 'kg' });

  expect(result._id).toBe('m1');
});

it('refuses a reference already used (409)', async () => {
  materialRepository.findByReference.mockResolvedValue({ _id: 'other' }); // already exists

  await expect(
    materialService.createMaterial({ reference: 'MAT-001', name: 'Wood', unit: 'kg' })
  ).rejects.toMatchObject({ status: 409 });
});

it('adds a stock entry and records an IN movement', async () => {
  materialRepository.findById.mockResolvedValue({ _id: 'm1' });
  materialRepository.addStock.mockResolvedValue({ _id: 'm1', quantity: 30 });

  await materialService.addStockEntry('m1', 10, 'user1');

  expect(materialRepository.addStock).toHaveBeenCalledTimes(1);
  expect(stockMovementRepository.create).toHaveBeenCalledTimes(1);
});

it('refuses a stock entry of 0 (400)', async () => {
  await expect(materialService.addStockEntry('m1', 0, 'user1')).rejects.toMatchObject({ status: 400 });
});
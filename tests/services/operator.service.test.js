const operatorService = require('../../src/services/operator.service');
const orderRepository = require('../../src/repositories/order.repository');
const materialRepository = require('../../src/repositories/material.repository');
const stockMovementRepository = require('../../src/repositories/stockMovement.repository');
const fakeTransaction = require('../helpers/fakeTransaction');

jest.mock('../../src/repositories/order.repository');
jest.mock('../../src/repositories/material.repository');
jest.mock('../../src/repositories/stockMovement.repository');

// Example: for 10 products we need 2 x 10 = 20 of m1 and 3 x 10 = 30 of m2
const makeOrder = (status) => ({
  _id: 'o1',
  operator: 'op1',
  status: status,
  quantity: 10,
  composition: [
    { material: 'm1', quantity: 2 },
    { material: 'm2', quantity: 3 },
  ],
});

// Sets the fake stock of the two materials
const setStock = (m1, m2) => {
  const materials = { m1: { name: 'Wood', quantity: m1 }, m2: { name: 'Screws', quantity: m2 } };
  materialRepository.findById.mockImplementation(async (id) => materials[id]);
};

beforeEach(() => {
  jest.resetAllMocks();
  fakeTransaction();
  orderRepository.findRawById.mockResolvedValue(makeOrder('PLANNED'));
  orderRepository.startOrder.mockResolvedValue(makeOrder('IN_PROGRESS'));
  orderRepository.findById.mockResolvedValue({ _id: 'o1', status: 'IN_PROGRESS' });
  materialRepository.deductStock.mockResolvedValue({});
  stockMovementRepository.create.mockResolvedValue({});
});

it('starts an order: deducts 20 and 30 and records 2 movements', async () => {
  setStock(100, 100); // enough stock

  await operatorService.startOrder('o1', 'op1');

  expect(materialRepository.deductStock).toHaveBeenCalledWith('m1', 20, expect.anything());
  expect(materialRepository.deductStock).toHaveBeenCalledWith('m2', 30, expect.anything());
  expect(stockMovementRepository.create).toHaveBeenCalledTimes(2);
});

it('refuses to start when a material is missing and deducts nothing (409)', async () => {
  setStock(100, 25); // we need 30 of m2 but there are only 25

  await expect(operatorService.startOrder('o1', 'op1')).rejects.toMatchObject({ status: 409 });
  expect(materialRepository.deductStock).not.toHaveBeenCalled(); // nothing deducted
});

it('refuses a second start of the same order (409)', async () => {
  setStock(100, 100);
  orderRepository.findRawById.mockResolvedValue(makeOrder('IN_PROGRESS')); // already started

  await expect(operatorService.startOrder('o1', 'op1')).rejects.toMatchObject({ status: 409 });
  expect(materialRepository.deductStock).not.toHaveBeenCalled(); // no second deduction
});

it('completes an order that is in progress', async () => {
  orderRepository.findRawById.mockResolvedValue(makeOrder('IN_PROGRESS'));
  orderRepository.update.mockResolvedValue({ _id: 'o1', status: 'COMPLETED' });

  await operatorService.completeOrder('o1', 'op1');

  expect(orderRepository.update).toHaveBeenCalledTimes(1);
});
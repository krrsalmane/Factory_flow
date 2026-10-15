const installationService = require('../../src/services/installation.service');
const installationRepository = require('../../src/repositories/installation.repository');
const userService = require('../../src/services/user.service');
const fakeTransaction = require('../helpers/fakeTransaction');

// Fake versions: no real database is used
jest.mock('../../src/repositories/installation.repository');
jest.mock('../../src/services/user.service');

const adminData = { name: 'First Admin', email: 'admin@factoryflow.com', password: 'admin123' };

// Runs before each test: clears the fakes
beforeEach(() => {
  jest.resetAllMocks();
  fakeTransaction();
});

it('installs the app: creates the first admin and saves the installation', async () => {
  installationRepository.find.mockResolvedValue(null); // not installed yet
  userService.createUser.mockResolvedValue({ _id: 'admin1' });

  await installationService.install(adminData);

  expect(userService.createUser).toHaveBeenCalledTimes(1);
  expect(installationRepository.create).toHaveBeenCalledTimes(1);
});

it('refuses a second installation (409)', async () => {
  installationRepository.find.mockResolvedValue({ _id: 'i1' }); // already installed

  await expect(installationService.install(adminData)).rejects.toMatchObject({ status: 409 });
  expect(userService.createUser).not.toHaveBeenCalled(); // no admin created
});
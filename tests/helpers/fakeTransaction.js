const mongoose = require('mongoose');

// The services open a MongoDB transaction with mongoose.startSession().
// In unit tests there is no database, so we replace it with a fake one:
// the "transaction" just runs the code.
module.exports = () => {
  mongoose.startSession = jest.fn().mockResolvedValue({
    withTransaction: async (fn) => {
      await fn();
    },
    endSession: jest.fn(),
  });
};

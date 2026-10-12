// Forward rejected async controller handlers to Express's error middleware.
module.exports = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

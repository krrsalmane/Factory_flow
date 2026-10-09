// Global error handler: every error ends here and becomes a clear JSON response
module.exports = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;

  if (err.code === 11000) {
    status = 409; // duplicate value (unique index)
    message = 'This value already exists';
  } else if (err.name === 'ValidationError') {
    status = 400; // Mongoose validation
  }

  if (status === 500) {
    console.error(err);
    message = 'Internal server error';
  }

  res.status(status).json({ status, error: message });
};
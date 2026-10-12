
module.exports = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;

  if (err.code === 11000) {
    status = 409; 
    message = 'This value already exists';
  } else if (err.name === 'ValidationError') {
    status = 400; 
  }

  if (status === 500) {
    console.error(err);
    message = 'Internal server error';
  }

  res.status(status).json({ status, error: message });
};
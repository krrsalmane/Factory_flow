const authService = require('../services/auth.service');

exports.login = async (req, res, next) => {
  try {
    const token = await authService.login(req.body.email, req.body.password);
    res.json({ token });
  } catch (error) {
    next(error);
  }
};
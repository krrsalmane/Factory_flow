const router = require('express').Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/authenticate');

router.get('/me', authenticate, userController.getMe); 
router.post('/', authenticate, authorize('ADMIN'), userController.createUser); 

module.exports = router;

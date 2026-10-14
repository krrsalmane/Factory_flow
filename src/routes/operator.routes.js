const router = require('express').Router();
const operatorController = require('../controllers/operator.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Everything here is for operators only
router.use(authenticate, authorize('OPERATOR'));

router.get('/', operatorController.getMyOrders);
router.get('/history', operatorController.getMyHistory); // must stay before '/:id'
router.get('/:id', operatorController.getMyOrder);
router.post('/:id/start', operatorController.startOrder);
router.post('/:id/complete', operatorController.completeOrder);

module.exports = router;
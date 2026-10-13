const router = require('express').Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middlewares/authenticate');

// Everything here is for admins only
router.use(authenticate, authorize('ADMIN'));

router.post('/', productController.create);
router.get('/', productController.getAll);
router.get('/:id', productController.getOne);
router.patch('/:id', productController.update);

module.exports = router;

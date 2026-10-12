const router = require('express').Router();
const materialController = require('../controllers/material.controller');
const { authenticate, authorize } = require('../middlewares/authenticate');

// Everything here is for admins only
router.use(authenticate, authorize('ADMIN'));

router.get('/alerts', materialController.getAlerts); // must stay before '/:id'
router.post('/', materialController.create);
router.get('/', materialController.getAll);
router.get('/:id', materialController.getOne);
router.patch('/:id', materialController.update);
router.post('/:id/entries', materialController.addEntry);
router.get('/:id/movements', materialController.getMovements);

module.exports = router;

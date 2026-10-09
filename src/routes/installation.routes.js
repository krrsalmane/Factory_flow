const router = require('express').Router();
const installationController = require('../controllers/installation.controller')


router.get('/status', installationController.getStatus);
router.post('/', installationController.install)


module.exports = router;
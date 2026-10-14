const router = require('express').Router();
const orderController = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middlewares/authenticate');

router.use(authenticate, authorize('ADMIN'));


router.patch('/:id/cancel', orderController.cancel);

module.exports = router;

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Production orders
 */
/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a production order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderInput'
 *     responses:
 *       '201':
 *         description: Order created with the product composition captured as a snapshot
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '400':
 *         description: Invalid quantity, product ID or operator ID
 *       '401':
 *         description: Missing, invalid or expired bearer token
 *       '403':
 *         description: Admin role required
 *       '404':
 *         description: Product not found
 */
router.post('/', orderController.create);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: List production orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Orders sorted newest first
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       '401':
 *         description: Missing, invalid or expired bearer token
 *       '403':
 *         description: Admin role required
 */
router.get('/', orderController.getAll);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get a production order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 665f1a2b3c4d5e6f78901234
 *     responses:
 *       '200':
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '400':
 *         description: Invalid order ID
 *       '401':
 *         description: Missing, invalid or expired bearer token
 *       '403':
 *         description: Admin role required
 *       '404':
 *         description: Order not found
 */
router.get('/:id', orderController.getOne);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Move an order to its next status
 *     description: Allowed transitions are PLANNED to IN_PROGRESS or CANCELED, then IN_PROGRESS to COMPLETED or CANCELED.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 665f1a2b3c4d5e6f78901234
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderStatusUpdate'
 *     responses:
 *       '200':
 *         description: Updated order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '400':
 *         description: Invalid status transition or ID
 *       '401':
 *         description: Missing, invalid or expired bearer token
 *       '403':
 *         description: Admin role required
 *       '404':
 *         description: Order not found
 */
router.patch('/:id/status', orderController.updateStatus);

module.exports = router;

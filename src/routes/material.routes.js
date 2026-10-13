const router = require('express').Router();
const materialController = require('../controllers/material.controller');
const { authenticate, authorize } = require('../middlewares/authenticate');

// Everything here is for admins only
router.use(authenticate, authorize('ADMIN'));

/**
 * @swagger
 * tags:
 *   - name: Materials
 *     description: Raw materials and inventory stock
 */

/**
 * @swagger
 * /api/materials:
 *   post:
 *     summary: Create a material
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaterialInput'
 *     responses:
 *       '201':
 *         description: Material created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Material'
 *       '400':
 *         description: Required fields or values are invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Missing, invalid or expired bearer token
 *       '403':
 *         description: Admin role required
 *       '409':
 *         description: Material reference already exists
 *       '500':
 *         description: Internal server error
 */
router.get('/alerts', materialController.getAlerts);

/**
 * @swagger
 * /api/materials:
 *   get:
 *     summary: List all materials
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Materials sorted by name
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Material'
 *       '401':
 *         description: Missing, invalid or expired bearer token
 *       '403':
 *         description: Admin role required
 *       '500':
 *         description: Internal server error
 */
router.get('/', materialController.getAll);

/**
 * @swagger
 * /api/materials/{id}:
 *   get:
 *     summary: Get one material
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB material ID
 *         schema:
 *           type: string
 *         example: 665f1a2b3c4d5e6f78901234
 *     responses:
 *       '200':
 *         description: Material details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Material'
 *       '401':
 *         description: Missing, invalid or expired bearer token
 *       '403':
 *         description: Admin role required
 *       '404':
 *         description: Material not found
 *       '500':
 *         description: Internal server error
 */
router.get('/:id', materialController.getOne);

/**
 * @swagger
 * /api/materials/{id}:
 *   patch:
 *     summary: Update material details
 *     tags: [Materials]
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
 *             $ref: '#/components/schemas/MaterialUpdate'
 *     responses:
 *       '200':
 *         description: Updated material
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Material'
 *       '400':
 *         description: Invalid fields, immutable field supplied, or empty update
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Missing, invalid or expired bearer token
 *       '403':
 *         description: Admin role required
 *       '404':
 *         description: Material not found
 *       '500':
 *         description: Internal server error
 */
router.patch('/:id', materialController.update);

/**
 * @swagger
 * /api/materials/{id}/entries:
 *   post:
 *     summary: Add stock to a material
 *     description: Adds the quantity and records an IN stock movement atomically.
 *     tags: [Materials]
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
 *             $ref: '#/components/schemas/StockEntry'
 *     responses:
 *       '201':
 *         description: Updated material after stock receipt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Material'
 *       '400':
 *         description: Quantity must be a number greater than zero
 *       '401':
 *         description: Missing, invalid or expired bearer token
 *       '403':
 *         description: Admin role required
 *       '404':
 *         description: Material not found
 *       '500':
 *         description: Internal server error
 */
router.post('/:id/entries', materialController.addEntry);

/**
 * @swagger
 * /api/materials/{id}/movements:
 *   get:
 *     summary: List stock movements for a material
 *     tags: [Materials]
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
 *         description: Movements newest first; user includes name and email
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StockMovement'
 *       '401':
 *         description: Missing, invalid or expired bearer token
 *       '403':
 *         description: Admin role required
 *       '404':
 *         description: Material not found
 *       '500':
 *         description: Internal server error
 */
router.get('/:id/movements', materialController.getMovements);

/**
 * @swagger
 * /api/materials/alerts:
 *   get:
 *     summary: List materials at or below their reorder point
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Low stock materials sorted by name
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Material'
 *       '401':
 *         description: Missing, invalid or expired bearer token
 *       '403':
 *         description: Admin role required
 *       '500':
 *         description: Internal server error
 */
router.get('/alerts', materialController.getAlerts);
router.post('/', materialController.create);

module.exports = router;

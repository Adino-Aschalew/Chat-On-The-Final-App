const express = require('express');
const { userController } = require('../controllers/user.controller');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication (but NOT admin role)
router.use(authenticate);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Search or list all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for username or email (optional)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Max number of users to return
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', userController.searchUsers);
router.get('/:id', userController.getUserById);

module.exports = router;

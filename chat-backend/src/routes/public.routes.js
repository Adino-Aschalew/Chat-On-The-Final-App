const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get public landing page statistics
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Successfully retrieved statistics
 */
router.get('/', publicController.getLandingStats);

module.exports = router;

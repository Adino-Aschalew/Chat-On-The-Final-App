const express = require('express');
const linkController = require('../controllers/link.controller');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/preview', linkController.getPreview);

module.exports = router;

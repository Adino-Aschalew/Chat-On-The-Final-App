const express = require('express');
const fileController = require('../controllers/file.controller');
const upload = require('../middleware/upload.middleware');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/upload', upload.single('file'), fileController.uploadFile);
router.delete('/:id', fileController.deleteFile);

module.exports = router;

const express = require('express');
const router = express.Router();
const { 
  scheduleMessage, 
  getUserScheduledMessages, 
  cancelScheduledMessage, 
  validateScheduleMessage 
} = require('../controllers/scheduledMessage.controller');
const authenticate = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/:chatId', validateScheduleMessage, scheduleMessage);
router.get('/', getUserScheduledMessages);
router.delete('/:id', cancelScheduledMessage);

module.exports = router;

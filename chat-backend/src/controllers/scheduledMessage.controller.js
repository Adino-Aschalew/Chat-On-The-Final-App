const scheduledMessageService = require('../services/scheduledMessage.service');
const { validationResult, body } = require('express-validator');

const scheduleMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const { chatId } = req.params;
    const scheduledMessage = await scheduledMessageService.scheduleMessage(
      req.user.id,
      chatId,
      req.body
    );

    res.status(201).json({
      success: true,
      data: scheduledMessage
    });
  } catch (error) {
    next(error);
  }
};

const getUserScheduledMessages = async (req, res, next) => {
  try {
    const { chatId } = req.query;
    const messages = await scheduledMessageService.getUserScheduledMessages(
      req.user.id,
      chatId
    );

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

const cancelScheduledMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scheduledMessage = await scheduledMessageService.cancelScheduledMessage(
      req.user.id,
      id
    );

    res.status(200).json({
      success: true,
      message: 'Scheduled message cancelled',
      data: scheduledMessage
    });
  } catch (error) {
    next(error);
  }
};

const validateScheduleMessage = [
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 4000 })
    .withMessage('Content must not exceed 4000 characters'),
  body('scheduledFor')
    .notEmpty()
    .withMessage('Scheduled date/time is required')
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }
      return true;
    }),
  body('messageType')
    .optional()
    .isIn(['TEXT', 'IMAGE', 'FILE'])
    .withMessage('Message type must be TEXT, IMAGE, or FILE'),
  body('isRecurring')
    .optional()
    .isBoolean()
    .withMessage('isRecurring must be a boolean'),
  body('recurringPattern')
    .optional()
    .isIn(['DAILY', 'WEEKLY', 'MONTHLY'])
    .withMessage('Recurring pattern must be DAILY, WEEKLY, or MONTHLY'),
  body('recurringEndDate')
    .optional()
    .isISO8601()
    .withMessage('Recurring end date must be a valid ISO8601 date')
];

module.exports = {
  scheduleMessage,
  getUserScheduledMessages,
  cancelScheduledMessage,
  validateScheduleMessage
};

const messageService = require('../services/message.service');
const { body, validationResult } = require('express-validator');

class MessageController {
  async sendMessage(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const message = await messageService.sendMessage(req.body, req.user.id);
      
      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message
      });
    } catch (error) {
      next(error);
    }
  }

  async getChatMessages(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const result = await messageService.getChatMessages(req.params.chatId, req.user.id, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessageById(req, res, next) {
    try {
      const message = await messageService.getMessageById(req.params.id, req.user.id);
      
      res.json({
        success: true,
        data: message
      });
    } catch (error) {
      next(error);
    }
  }

  async editMessage(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const message = await messageService.editMessage(req.params.id, req.body.content, req.user.id);
      
      res.json({
        success: true,
        message: 'Message updated successfully',
        data: message
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req, res, next) {
    try {
      const result = await messageService.deleteMessage(req.params.id, req.user.id);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const readReceipt = await messageService.markAsRead(req.params.id, req.user.id);
      
      res.json({
        success: true,
        message: 'Message marked as read',
        data: readReceipt
      });
    } catch (error) {
      next(error);
    }
  }

  async markChatAsRead(req, res, next) {
    try {
      const result = await messageService.markChatAsRead(req.params.chatId, req.user.id);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const result = await messageService.getUnreadCount(req.params.chatId, req.user.id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async clearChatHistory(req, res, next) {
    try {
      const result = await messageService.clearChatHistory(req.params.chatId, req.user.id);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getReadReceipts(req, res, next) {
    try {
      const result = await messageService.getReadReceipts(req.params.id, req.user.id);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async translateMessage(req, res, next) {
    try {
      const { targetLang } = req.body;
      const translationService = require('../services/translation.service');
      const message = await messageService.getMessageById(req.params.id, req.user.id);
      
      if (message.messageType !== 'TEXT') {
        return res.status(400).json({
          success: false,
          message: 'Only text messages can be translated'
        });
      }

      const result = await translationService.translateText(message.content, targetLang);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

// Validation middleware
const validateSendMessage = [
  body('chatId')
    .isUUID()
    .withMessage('Chat ID must be a valid UUID'),
  body('content')
    .if(body('messageType').equals('TEXT'))
    .notEmpty()
    .withMessage('Content is required for text messages')
    .isLength({ min: 1, max: 4000 })
    .withMessage('Content must be between 1 and 4000 characters'),
  body('messageType')
    .optional()
    .isIn(['TEXT', 'IMAGE', 'FILE', 'SYSTEM'])
    .withMessage('Message type must be TEXT, IMAGE, FILE, or SYSTEM'),
  body('replyToId')
    .optional()
    .isUUID()
    .withMessage('Reply to ID must be a valid UUID'),
  body('fileUrl')
    .if(body('messageType').not().equals('TEXT'))
    .notEmpty()
    .withMessage('File URL is required for non-text messages'),
  body('fileName')
    .optional()
    .isLength({ max: 255 })
    .withMessage('File name must not exceed 255 characters'),
  body('fileSize')
    .optional()
    .isInt({ min: 0 })
    .withMessage('File size must be a non-negative integer')
];

const validateEditMessage = [
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 1, max: 4000 })
    .withMessage('Content must be between 1 and 4000 characters')
];

module.exports = {
  messageController: new MessageController(),
  validateSendMessage,
  validateEditMessage
};

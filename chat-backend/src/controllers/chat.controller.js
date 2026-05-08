const chatService = require('../services/chat.service');
const { body, validationResult } = require('express-validator');

class ChatController {
  async createChat(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const chat = await chatService.createChat(req.body, req.user.id);
      
      res.status(201).json({
        success: true,
        message: 'Chat created successfully',
        data: chat
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserChats(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await chatService.getUserChats(req.user.id, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getChatById(req, res, next) {
    try {
      const chat = await chatService.getChatById(req.params.id, req.user.id);
      
      res.json({
        success: true,
        data: chat
      });
    } catch (error) {
      next(error);
    }
  }

  async updateChat(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const chat = await chatService.updateChat(req.params.id, req.body, req.user.id);
      
      res.json({
        success: true,
        message: 'Chat updated successfully',
        data: chat
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteChat(req, res, next) {
    try {
      const result = await chatService.deleteChat(req.params.id, req.user.id);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async addMember(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const chat = await chatService.addMember(req.params.id, req.body.memberIds, req.user.id);
      
      res.json({
        success: true,
        message: 'Members added successfully',
        data: chat
      });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req, res, next) {
    try {
      const result = await chatService.removeMember(req.params.id, req.params.memberId, req.user.id);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async leaveChat(req, res, next) {
    try {
      const result = await chatService.leaveChat(req.params.id, req.user.id);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async pinMessage(req, res, next) {
    try {
      const chat = await chatService.pinMessage(req.params.id, req.params.messageId, req.user.id);
      res.json({
        success: true,
        message: 'Message pinned successfully',
        data: chat
      });
    } catch (error) {
      next(error);
    }
  }

  async unpinMessage(req, res, next) {
    try {
      const chat = await chatService.unpinMessage(req.params.id, req.user.id);
      res.json({
        success: true,
        message: 'Message unpinned successfully',
        data: chat
      });
    } catch (error) {
      next(error);
    }
  }
}

// Validation middleware
const validateCreateChat = [
  body('type')
    .isIn(['PRIVATE', 'GROUP', 'CHANNEL'])
    .withMessage('Chat type must be PRIVATE, GROUP, or CHANNEL'),
  body('name')
    .if(body('type').not().equals('PRIVATE'))
    .notEmpty()
    .withMessage('Chat name is required for non-private chats')
    .isLength({ min: 1, max: 100 })
    .withMessage('Chat name must be between 1 and 100 characters'),
  body('memberIds')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Member IDs must be an array with at least one element'),
  body('memberIds.*')
    .optional()
    .isUUID()
    .withMessage('Each member ID must be a valid UUID'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
];

const validateUpdateChat = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Chat name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

const validateAddMembers = [
  body('memberIds')
    .isArray({ min: 1 })
    .withMessage('Member IDs must be an array with at least one element'),
  body('memberIds.*')
    .isUUID()
    .withMessage('Each member ID must be a valid UUID')
];

module.exports = {
  chatController: new ChatController(),
  validateCreateChat,
  validateUpdateChat,
  validateAddMembers
};

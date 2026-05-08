const express = require('express');
const { messageController, validateSendMessage, validateEditMessage } = require('../controllers/message.controller');
const authenticate = require('../middleware/auth.middleware');
const { isMemberOrAdmin } = require('../middleware/role.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         content:
 *           type: string
 *         senderId:
 *           type: string
 *           format: uuid
 *         chatId:
 *           type: string
 *           format: uuid
 *         replyToId:
 *           type: string
 *           format: uuid
 *         messageType:
 *           type: string
 *           enum: [TEXT, IMAGE, FILE, SYSTEM]
 *         fileUrl:
 *           type: string
 *         fileName:
 *           type: string
 *         fileSize:
 *           type: integer
 *         isEdited:
 *           type: boolean
 *         editedAt:
 *           type: string
 *           format: date-time
 *         originalContent:
 *           type: string
 *         isDeleted:
 *           type: boolean
 *         deletedAt:
 *           type: string
 *           format: date-time
 *         isDelivered:
 *           type: boolean
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         sender:
 *           $ref: '#/components/schemas/User'
 *         replyTo:
 *           $ref: '#/components/schemas/Message'
 *         reactions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               messageId:
 *                 type: string
 *               userId:
 *                 type: string
 *               emoji:
 *                 type: string
 *               user:
 *                 $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *             properties:
 *               chatId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the chat to send message to
 *               content:
 *                 type: string
 *                 maxLength: 4000
 *                 description: Message content (required for text messages)
 *               messageType:
 *                 type: string
 *                 enum: [TEXT, IMAGE, FILE, SYSTEM]
 *                 default: TEXT
 *                 description: Type of message
 *               replyToId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of message to reply to
 *               fileUrl:
 *                 type: string
 *                 description: URL of attached file (required for non-text messages)
 *               fileName:
 *                 type: string
 *                 maxLength: 255
 *                 description: Name of attached file
 *               fileSize:
 *                 type: integer
 *                 minimum: 0
 *                 description: Size of attached file in bytes
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not a member)
 *       500:
 *         description: Server error
 */
router.post('/', validateSendMessage, messageController.sendMessage);

/**
 * @swagger
 * /api/messages/chat/{chatId}:
 *   get:
 *     summary: Get messages for a chat
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Chat ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of messages per page
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
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
 *                     messages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not a member)
 *       500:
 *         description: Server error
 */
router.get('/chat/:chatId', messageController.getChatMessages);

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     summary: Get message by ID
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not a member)
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.get('/:id', messageController.getMessageById);

/**
 * @swagger
 * /api/messages/{id}:
 *   put:
 *     summary: Edit a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Message ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 4000
 *                 description: New message content
 *     responses:
 *       200:
 *         description: Message updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not message owner)
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.put('/:id', validateEditMessage, messageController.editMessage);

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not message owner)
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', messageController.deleteMessage);

/**
 * @swagger
 * /api/messages/{id}/read:
 *   post:
 *     summary: Mark message as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message marked as read
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not a member)
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.post('/:id/read', messageController.markAsRead);

/**
 * @swagger
 * /api/messages/chat/{chatId}/read:
 *   post:
 *     summary: Mark all messages in chat as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: All messages marked as read
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not a member)
 *       500:
 *         description: Server error
 */
router.post('/chat/:chatId/read', messageController.markChatAsRead);

/**
 * @swagger
 * /api/messages/chat/{chatId}/unread-count:
 *   get:
 *     summary: Get unread message count for chat
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
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
 *                     unreadCount:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not a member)
 *       500:
 *         description: Server error
 */
router.get('/chat/:chatId/unread-count', messageController.getUnreadCount);

/**
 * @swagger
 * /api/messages/chat/{chatId}/clear:
 *   delete:
 *     summary: Clear chat history
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat history cleared successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not a member)
 *       500:
 *         description: Server error
 */
router.delete('/chat/:chatId/clear', messageController.clearChatHistory);

// Get read receipts (who read the message)
router.get('/:id/read-receipts', messageController.getReadReceipts);

// Translate message
router.post('/:id/translate', messageController.translateMessage);

module.exports = router;

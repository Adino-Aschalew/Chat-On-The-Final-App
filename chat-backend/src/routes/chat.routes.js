const express = require('express');
const { chatController, validateCreateChat, validateUpdateChat, validateAddMembers } = require('../controllers/chat.controller');
const authenticate = require('../middleware/auth.middleware');
const { isMemberOrAdmin } = require('../middleware/role.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [PRIVATE, GROUP, CHANNEL]
 *         description:
 *           type: string
 *         avatar:
 *           type: string
 *         isArchived:
 *           type: boolean
 *         lastMessageAt:
 *           type: string
 *           format: date-time
 *         memberCount:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         members:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               userId:
 *                 type: string
 *               chatId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER]
 *               joinedAt:
 *                 type: string
 *                 format: date-time
 *               user:
 *                 $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/chats:
 *   post:
 *     summary: Create a new chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Required for GROUP and CHANNEL chats
 *               type:
 *                 type: string
 *                 enum: [PRIVATE, GROUP, CHANNEL]
 *                 description: Type of chat to create
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of user IDs to add as members (excluding creator)
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional chat description
 *     responses:
 *       201:
 *         description: Chat created successfully
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
 *                   $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', validateCreateChat, chatController.createChat);

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: Get all chats for the authenticated user
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 20
 *         description: Number of chats per page
 *     responses:
 *       200:
 *         description: Chats retrieved successfully
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
 *                     chats:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Chat'
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
 *       500:
 *         description: Server error
 */
router.get('/', chatController.getUserChats);

/**
 * @swagger
 * /api/chats/{id}:
 *   get:
 *     summary: Get chat by ID
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Chat'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not a member)
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
router.get('/:id', chatController.getChatById);

/**
 * @swagger
 * /api/chats/{id}:
 *   put:
 *     summary: Update chat details
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               avatar:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Chat updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not an admin)
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
router.put('/:id', validateUpdateChat, chatController.updateChat);

/**
 * @swagger
 * /api/chats/{id}:
 *   delete:
 *     summary: Delete chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not an admin)
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', chatController.deleteChat);

/**
 * @swagger
 * /api/chats/{id}/members:
 *   post:
 *     summary: Add members to chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberIds
 *             properties:
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of user IDs to add as members
 *     responses:
 *       200:
 *         description: Members added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not an admin)
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
router.post('/:id/members', validateAddMembers, chatController.addMember);

/**
 * @swagger
 * /api/chats/{id}/members/{memberId}:
 *   delete:
 *     summary: Remove member from chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Chat ID
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Member ID to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (not an admin)
 *       404:
 *         description: Chat or member not found
 *       500:
 *         description: Server error
 */
router.delete('/:id/members/:memberId', chatController.removeMember);

/**
 * @swagger
 * /api/chats/{id}/leave:
 *   post:
 *     summary: Leave chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Left chat successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found or not a member
 *       500:
 *         description: Server error
 */
router.post('/:id/leave', chatController.leaveChat);

// Pin/Unpin message
router.post('/:id/pin/:messageId', chatController.pinMessage);
router.post('/:id/unpin', chatController.unpinMessage);

module.exports = router;

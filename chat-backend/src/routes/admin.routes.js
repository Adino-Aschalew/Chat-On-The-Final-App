const express = require('express');
const { adminController, validatePagination, validateUpdateRole, validateAnalytics } = require('../controllers/admin.controller');
const authenticate = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/role.middleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

/**
 * @swagger
 * components:
 *   schemas:
 *     SystemStats:
 *       type: object
 *       properties:
 *         totalUsers:
 *           type: integer
 *         totalChats:
 *           type: integer
 *         totalMessages:
 *           type: integer
 *         onlineUsers:
 *           type: integer
 *         activeChats:
 *           type: integer
 *         newUsersToday:
 *           type: integer
 *         newMessagesToday:
 *           type: integer
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
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
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for username or email
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
 *         description: Access denied (Admin only)
 *       500:
 *         description: Server error
 */
router.get('/users', validatePagination, adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (Admin only)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/users/:id', adminController.getUserById);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (Admin only)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/users/:id', adminController.deleteUser);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Update user role (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 description: New user role
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (Admin only)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/users/:id/role', validateUpdateRole, adminController.updateUserRole);

/**
 * @swagger
 * /api/admin/chats:
 *   get:
 *     summary: Get all chats (Admin only)
 *     tags: [Admin]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for chat name or type
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
 *       403:
 *         description: Access denied (Admin only)
 *       500:
 *         description: Server error
 */
router.get('/chats', validatePagination, adminController.getAllChats);

/**
 * @swagger
 * /api/admin/chats/{id}:
 *   get:
 *     summary: Get chat by ID (Admin only)
 *     tags: [Admin]
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
 *         description: Access denied (Admin only)
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
router.get('/chats/:id', adminController.getChatById);

/**
 * @swagger
 * /api/admin/chats/{id}:
 *   delete:
 *     summary: Delete chat (Admin only)
 *     tags: [Admin]
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
 *         description: Access denied (Admin only)
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
router.delete('/chats/:id', adminController.deleteChat);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SystemStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (Admin only)
 *       500:
 *         description: Server error
 */
router.get('/stats', adminController.getSystemStats);

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get system analytics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [1d, 7d, 30d, 90d]
 *           default: 7d
 *         description: Time period for analytics
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
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
 *                     period:
 *                       type: string
 *                     userGrowth:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     messageVolume:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     chatCreation:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     topActiveUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           senderId:
 *                             type: string
 *                           messageCount:
 *                             type: integer
 *                           sender:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *                     topActiveChats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           chatId:
 *                             type: string
 *                           messageCount:
 *                             type: integer
 *                           chat:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               type:
 *                                 type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (Admin only)
 *       500:
 *         description: Server error
 */
router.get('/analytics', validateAnalytics, adminController.getAnalytics);

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Get admin settings (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin settings retrieved successfully
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
 *                     maintenanceMode:
 *                       type: boolean
 *                     allowRegistrations:
 *                       type: boolean
 *                     maxUsers:
 *                       type: integer
 *                     messageRetention:
 *                       type: integer
 *                     autoBackup:
 *                       type: boolean
 *                     debugMode:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (Admin only)
 *       500:
 *         description: Server error
 */
router.get('/settings', adminController.getSettings);

/**
 * @swagger
 * /api/admin/settings:
 *   put:
 *     summary: Update admin settings (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maintenanceMode:
 *                 type: boolean
 *               allowRegistrations:
 *                 type: boolean
 *               maxUsers:
 *                 type: integer
 *               messageRetention:
 *                 type: integer
 *               autoBackup:
 *                 type: boolean
 *               debugMode:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (Admin only)
 *       500:
 *         description: Server error
 */
router.put('/settings', adminController.updateSettings);

/**
 * @swagger
 * /api/admin/security-settings:
 *   get:
 *     summary: Get security settings (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security settings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.get('/security-settings', adminController.getSecuritySettings);

/**
 * @swagger
 * /api/admin/security-settings:
 *   put:
 *     summary: Update security settings (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               twoFactorAuth:
 *                 type: boolean
 *               sessionTimeout:
 *                 type: integer
 *               passwordMinLength:
 *                 type: integer
 *               requireEmailVerification:
 *                 type: boolean
 *               maxLoginAttempts:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Security settings updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.put('/security-settings', adminController.updateSecuritySettings);

/**
 * @swagger
 * /api/admin/change-password:
 *   put:
 *     summary: Change admin password (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (Admin only)
 *       500:
 *         description: Server error
 */
router.put('/change-password', adminController.changePassword);

/**
 * @swagger
 * /api/admin/maintenance:
 *   post:
 *     summary: Toggle maintenance mode (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enabled
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 description: Maintenance mode status
 *     responses:
 *       200:
 *         description: Maintenance mode toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (Admin only)
 *       500:
 *         description: Server error
 */
router.post('/maintenance', adminController.toggleMaintenance);

/**
 * @swagger
 * /api/admin/backup:
 *   post:
 *     summary: Create system backup (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 backupPath:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (Admin only)
 *       500:
 *         description: Server error
 */
router.post('/backup', adminController.createBackup);

/**
 * @swagger
 * /api/admin/clear-cache:
 *   post:
 *     summary: Clear system cache (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (Admin only)
 *       500:
 *         description: Server error
 */
router.post('/clear-cache', adminController.clearCache);

/**
 * @swagger
 * /api/admin/admins:
 *   get:
 *     summary: Get all admin users (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of admin users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get('/admins', adminController.getAdmins);

/**
 * @swagger
 * /api/admin/admins:
 *   post:
 *     summary: Create new admin user (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.post('/admins', adminController.createAdmin);

/**
 * @swagger
 * /api/admin/admins/{id}:
 *   delete:
 *     summary: Delete admin user (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Admin not found
 */
router.delete('/admins/:id', adminController.deleteAdmin);

/**
 * @swagger
 * /api/admin/admins/{id}/suspend:
 *   put:
 *     summary: Suspend or unsuspend admin user (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               suspended:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Admin status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Admin not found
 */
router.put('/admins/:id/suspend', adminController.toggleAdminSuspend);

/**
 * @swagger
 * /api/admin/logs/{adminId}:
 *   get:
 *     summary: Get admin activity logs (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get('/logs/:adminId', adminController.getAdminLogs);

module.exports = router;

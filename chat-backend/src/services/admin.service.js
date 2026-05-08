const db = require('../models');
const { User, Chat, Message, ChatMember, SystemSetting, sequelize } = db;
const { logger } = require('../middleware/error.middleware');
const { Op } = require('sequelize');
const { getIO } = require('../sockets/chat.socket');

class AdminService {
  async getAllUsers(page = 1, limit = 20, search = '') {
    try {
      const offset = (page - 1) * limit;
      const whereClause = {};

      if (search) {
        whereClause[Op.or] = [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      const users = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        include: [
          {
            model: ChatMember,
            as: 'chatMemberships',
            attributes: ['id']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      const usersWithStats = users.rows.map(user => ({
        ...user.toJSON(),
        chatCount: user.chatMemberships.length
      }));

      return {
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total: users.count,
          pages: Math.ceil(users.count / limit)
        }
      };
    } catch (error) {
      logger.error('Get all users error:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: ChatMember,
            as: 'chatMemberships',
            include: [
              {
                model: Chat,
                as: 'chat',
                attributes: ['id', 'name', 'type', 'createdAt']
              }
            ]
          },
          {
            model: Message,
            as: 'sentMessages',
            attributes: ['id', 'content', 'createdAt']
          }
        ]
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role === 'ADMIN') {
        throw new Error('Cannot delete admin users');
      }

      // Delete user's chat memberships (if table exists)
      try {
        await ChatMember.destroy({
          where: { userId }
        });
      } catch (error) {
        logger.warn('ChatMember deletion failed (table might not exist):', error.message);
      }

      // Delete user's messages (if table exists)
      try {
        await Message.destroy({
          where: { senderId: userId }
        });
      } catch (error) {
        logger.warn('Message deletion failed (table might not exist):', error.message);
      }

      // Delete user
      await User.destroy({
        where: { id: userId }
      });

      logger.info(`User deleted: ${userId}`);

      return { message: 'User deleted successfully' };
    } catch (error) {
      logger.error('Delete user error:', error);
      throw error;
    }
  }

  async updateUserRole(userId, role) {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role === 'ADMIN' && role === 'USER') {
        // Check if this is the last admin
        const adminCount = await User.count({
          where: { role: 'ADMIN' }
        });

        if (adminCount <= 1) {
          throw new Error('Cannot remove admin role from the last admin user');
        }
      }

      await user.update({ role });

      logger.info(`User role updated: ${userId} to ${role}`);

      return user.toSafeObject();
    } catch (error) {
      logger.error('Update user role error:', error);
      throw error;
    }
  }

  async getAllChats(page = 1, limit = 20, search = '') {
    try {
      const offset = (page - 1) * limit;
      const whereClause = {};

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { type: { [Op.like]: `%${search}%` } }
        ];
      }

      const chats = await Chat.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: ChatMember,
            as: 'members',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email']
              }
            ]
          },
          {
            model: Message,
            as: 'messages',
            limit: 1,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'content', 'createdAt']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return {
        chats: chats.rows,
        pagination: {
          page,
          limit,
          total: chats.count,
          pages: Math.ceil(chats.count / limit)
        }
      };
    } catch (error) {
      logger.error('Get all chats error:', error);
      throw error;
    }
  }

  async getChatById(chatId) {
    try {
      const chat = await Chat.findByPk(chatId, {
        include: [
          {
            model: ChatMember,
            as: 'members',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email', 'isOnline', 'lastSeen']
              }
            ]
          },
          {
            model: Message,
            as: 'messages',
            limit: 50,
            order: [['createdAt', 'DESC']],
            include: [
              {
                model: User,
                as: 'sender',
                attributes: ['id', 'username']
              }
            ]
          }
        ]
      });

      if (!chat) {
        throw new Error('Chat not found');
      }

      return chat;
    } catch (error) {
      logger.error('Get chat by ID error:', error);
      throw error;
    }
  }

  async deleteChat(chatId) {
    const transaction = await sequelize.transaction();
    
    try {
      const chat = await Chat.findByPk(chatId);
      
      if (!chat) {
        throw new Error('Chat not found');
      }

      // Delete all related data
      await ChatMember.destroy({ where: { chatId }, transaction });
      await Message.destroy({ where: { chatId }, transaction });
      await Chat.destroy({ where: { id: chatId }, transaction });

      await transaction.commit();

      logger.info(`Chat deleted: ${chatId}`);

      return { message: 'Chat deleted successfully' };
    } catch (error) {
      await transaction.rollback();
      logger.error('Delete chat error:', error);
      throw error;
    }
  }

  async getSystemStats() {
    try {
      const [
        totalUsers,
        totalChats,
        totalMessages,
        onlineUsers,
        activeChats,
        newUsersToday,
        newMessagesToday
      ] = await Promise.all([
        User.count(),
        Chat.count(),
        Message.count(),
        User.count({ where: { isOnline: true } }),
        Chat.count({
          where: {
            lastMessageAt: {
              [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        }),
        User.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) // Today
            }
          }
        }),
        Message.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) // Today
            }
          }
        })
      ]);

      return {
        totalUsers,
        totalChats,
        totalMessages,
        onlineUsers,
        activeChats,
        newUsersToday,
        newMessagesToday
      };
    } catch (error) {
      logger.error('Get system stats error:', error);
      throw error;
    }
  }

  async getAnalytics(period = '7d') {
    try {
      let startDate;
      
      switch (period) {
        case '1d':
          startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }

      const [
        userGrowth,
        messageVolume,
        chatCreation,
        topActiveUsers,
        topActiveChats
      ] = await Promise.all([
        // User growth over time
        User.findAll({
          attributes: [
            [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          where: {
            createdAt: {
              [Op.gte]: startDate
            }
          },
          group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
          order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        }),
        // Message volume over time
        Message.findAll({
          attributes: [
            [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          where: {
            createdAt: {
              [Op.gte]: startDate
            }
          },
          group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
          order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        }),
        // Chat creation over time
        Chat.findAll({
          attributes: [
            [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          where: {
            createdAt: {
              [Op.gte]: startDate
            }
          },
          group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
          order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        }),
        // Top active users
        Message.findAll({
          attributes: [
            'senderId',
            [sequelize.fn('COUNT', sequelize.col('id')), 'messageCount']
          ],
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['username']
            }
          ],
          where: {
            createdAt: {
              [Op.gte]: startDate
            }
          },
          group: ['senderId', 'sender.id'],
          order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
          limit: 10
        }),
        // Top active chats
        Message.findAll({
          attributes: [
            'chatId',
            [sequelize.fn('COUNT', sequelize.col('id')), 'messageCount']
          ],
          include: [
            {
              model: Chat,
              as: 'chat',
              attributes: ['name', 'type']
            }
          ],
          where: {
            createdAt: {
              [Op.gte]: startDate
            }
          },
          group: ['chatId', 'chat.id'],
          order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
          limit: 10
        })
      ]);

      return {
        period,
        userGrowth,
        messageVolume,
        chatCreation,
        topActiveUsers,
        topActiveChats
      };
    } catch (error) {
      logger.error('Get analytics error:', error);
      throw error;
    }
  }

  // Settings management
  async getSettings() {
    try {
      const settings = await SystemSetting.findAll({
        attributes: ['key', 'value', 'type', 'description'],
        order: [['category', 'ASC'], ['key', 'ASC']]
      });

      // Convert settings array to object
      const settingsObj = {};
      settings.forEach(setting => {
        // Parse JSON values if needed
        let parsedValue = setting.value;
        if (setting.type === 'json') {
          try {
            parsedValue = JSON.parse(setting.value);
          } catch (e) {
            parsedValue = setting.value;
          }
        } else if (setting.type === 'number') {
          parsedValue = parseInt(setting.value, 10);
        } else if (setting.type === 'boolean') {
          parsedValue = setting.value === 'true';
        }

        settingsObj[setting.key] = parsedValue;
      });

      // Ensure all required settings exist with defaults
      const defaultSettings = {
        maintenanceMode: false,
        allowRegistrations: true,
        maxUsers: 1000,
        messageRetention: 30,
        autoBackup: true,
        debugMode: false,
        systemHealth: 95,
        ...settingsObj
      };

      return defaultSettings;
    } catch (error) {
      logger.error('Get settings error:', error);
      // Return defaults if table doesn't exist or there's an error
      return {
        maintenanceMode: false,
        allowRegistrations: true,
        maxUsers: 1000,
        messageRetention: 30,
        autoBackup: true,
        debugMode: false,
        systemHealth: 95
      };
    }
  }

  async updateSettings(settings, updatedBy = null) {
    const transaction = await sequelize.transaction();
    
    try {
      const updatedSettings = {};
      
      // Update each setting in the database
      for (const [key, value] of Object.entries(settings)) {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        const dataType = typeof value === 'boolean' ? 'boolean' : 
                        typeof value === 'number' ? 'number' : 'string';
        
        const [setting] = await SystemSetting.findOrCreate({
          where: { key },
          defaults: {
            key,
            value: stringValue,
            type: dataType,
            category: this.getSettingCategory(key),
            updatedBy,
          },
          transaction
        });

        await setting.update({
          value: stringValue,
          updatedBy,
        }, { transaction });
        
        updatedSettings[key] = value;
      }

      await transaction.commit();
      logger.info('Settings updated:', updatedSettings);

      // Broadcast critical settings changes to all users
      const io = getIO();
      
      // Broadcast registration setting change
      if ('allowRegistrations' in settings) {
        io.emit('system:registrations', {
          enabled: settings.allowRegistrations,
          message: settings.allowRegistrations 
            ? 'User registration is now enabled' 
            : 'User registration has been disabled by administrator',
          timestamp: new Date()
        });
      }

      // Broadcast max users change
      if ('maxUsers' in settings) {
        io.emit('system:user-limit', {
          limit: settings.maxUsers,
          message: `Maximum user limit set to ${settings.maxUsers}`,
          timestamp: new Date()
        });
      }

      // Broadcast debug mode change
      if ('debugMode' in settings) {
        io.emit('system:debug', {
          enabled: settings.debugMode,
          message: settings.debugMode 
            ? 'Debug mode has been enabled' 
            : 'Debug mode has been disabled',
          timestamp: new Date()
        });
      }

      return updatedSettings;
    } catch (error) {
      await transaction.rollback();
      logger.error('Update settings error:', error);
      throw error;
    }
  }

  // Helper method to determine setting category
  getSettingCategory(key) {
    const systemSettings = ['maintenanceMode', 'allowRegistrations', 'maxUsers', 'messageRetention', 'autoBackup', 'debugMode', 'systemHealth'];
    const securitySettings = ['twoFactorAuth', 'sessionTimeout', 'passwordMinLength', 'requireEmailVerification', 'maxLoginAttempts'];
    
    if (systemSettings.includes(key)) return 'system';
    if (securitySettings.includes(key)) return 'security';
    return 'maintenance';
  }

  async updateSecuritySettings(settings, updatedBy = null) {
    const transaction = await sequelize.transaction();
    
    try {
      const updatedSettings = {};
      
      // Update each security setting in the database
      for (const [key, value] of Object.entries(settings)) {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        const dataType = typeof value === 'boolean' ? 'boolean' : 
                        typeof value === 'number' ? 'number' : 'string';
        
        const [setting] = await SystemSetting.findOrCreate({
          where: { key },
          defaults: {
            key,
            value: stringValue,
            type: dataType,
            category: 'security',
            updatedBy,
          },
          transaction
        });

        await setting.update({
          value: stringValue,
          updatedBy,
        }, { transaction });
        
        updatedSettings[key] = value;
      }

      await transaction.commit();
      logger.info('Security settings updated:', updatedSettings);

      // Broadcast security changes to all users
      const io = getIO();
      
      // Broadcast password policy changes
      if ('passwordMinLength' in settings || 'maxLoginAttempts' in settings) {
        io.emit('system:security', {
          type: 'password-policy',
          passwordMinLength: updatedSettings.passwordMinLength,
          maxLoginAttempts: updatedSettings.maxLoginAttempts,
          message: 'Password security policy has been updated',
          timestamp: new Date()
        });
      }

      // Broadcast session timeout changes
      if ('sessionTimeout' in settings) {
        io.emit('system:security', {
          type: 'session-timeout',
          sessionTimeout: updatedSettings.sessionTimeout,
          message: 'Session timeout policy has been updated',
          timestamp: new Date()
        });
      }

      // Force logout of users with expired sessions
      if (settings.sessionTimeout < 24) {
        io.sockets.sockets.forEach(socket => {
          if (socket.user?.role !== 'ADMIN') {
            const sessionAge = (Date.now() - new Date(socket.loginTime).getTime()) / (1000 * 60 * 60);
            if (sessionAge > settings.sessionTimeout) {
              socket.emit('force:logout', {
                reason: 'session-expired',
                message: 'Your session has expired due to updated security policy.'
              });
              socket.disconnect();
            }
          }
        });
      }

      return updatedSettings;
    } catch (error) {
      await transaction.rollback();
      logger.error('Update security settings error:', error);
      throw error;
    }
  }

  async getSecuritySettings() {
    try {
      const settings = await SystemSetting.findAll({
        where: { category: 'security' }
      });

      const securitySettings = {};
      settings.forEach(setting => {
        const value = setting.type === 'boolean' ? setting.value === 'true' :
                       setting.type === 'number' ? Number(setting.value) :
                       setting.type === 'json' ? JSON.parse(setting.value) :
                       setting.value;
        securitySettings[setting.key] = value;
      });

      // Apply defaults if not set
      const defaults = {
        twoFactorAuth: false,
        sessionTimeout: 24,
        passwordMinLength: 8,
        requireEmailVerification: true,
        maxLoginAttempts: 5
      };

      return { ...defaults, ...securitySettings };
    } catch (error) {
      logger.error('Get security settings error:', error);
      // Return defaults if table doesn't exist or there's an error
      return {
        twoFactorAuth: false,
        sessionTimeout: 24,
        passwordMinLength: 8,
        requireEmailVerification: true,
        maxLoginAttempts: 5
      };
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const bcrypt = require('bcryptjs');
      
      // Find the user
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password using bcrypt
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Update password
      await user.update({ password: hashedPassword });

      logger.info(`Password changed for user: ${user.username}`);
      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  async toggleMaintenance(enabled, updatedBy = null) {
    const transaction = await sequelize.transaction();
    
    try {
      // Update maintenance mode in database using findOrCreate and update
      const [setting] = await SystemSetting.findOrCreate({
        where: { key: 'maintenanceMode' },
        defaults: {
          key: 'maintenanceMode',
          value: String(enabled),
          type: 'boolean',
          category: 'maintenance',
          updatedBy,
        },
        transaction
      });

      await setting.update({
        value: String(enabled),
        updatedBy,
      }, { transaction });

      await transaction.commit();
      logger.info(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
      
      // Broadcast to all connected users with enhanced notifications
      try {
        const io = getIO();
        
        // Send immediate maintenance status update
        io.emit('system:maintenance', {
          enabled,
          message: enabled 
            ? 'System is now in maintenance mode. Some features may be unavailable.' 
            : 'System is now fully operational.',
          timestamp: new Date(),
          details: {
            duration: enabled ? 'Until further notice' : null,
            affectedFeatures: enabled ? ['Chat', 'File Upload', 'User Registration'] : [],
            adminAccess: true,
            estimatedCompletion: enabled ? null : new Date()
          }
        });

        // If maintenance mode is enabled, handle user disconnection
        if (enabled) {
          let disconnectedCount = 0;
          
          // Send warning before disconnecting
          io.emit('system:maintenance-warning', {
            message: 'System will enter maintenance mode in 30 seconds. Please save your work.',
            countdown: 30,
            timestamp: new Date()
          });

          // Disconnect non-admin users after delay
          setTimeout(() => {
            io.sockets.sockets.forEach(socket => {
              if (socket.user?.role !== 'ADMIN') {
                // Send final warning
                socket.emit('force:logout', {
                  reason: 'maintenance',
                  message: 'System is under maintenance. Please try again later.',
                  redirectUrl: '/login',
                  allowReconnect: false,
                  timestamp: new Date()
                });
                
                socket.disconnect(true);
                disconnectedCount++;
              }
            });
            
            logger.info(`Disconnected ${disconnectedCount} non-admin users for maintenance mode`);
            
            // Notify admins about the disconnection
            io.sockets.sockets.forEach(socket => {
              if (socket.user?.role === 'ADMIN') {
                socket.emit('system:maintenance-admin-notice', {
                  message: `Maintenance mode activated. ${disconnectedCount} users disconnected.`,
                  connectedUsers: io.sockets.sockets.size,
                  timestamp: new Date()
                });
              }
            });
          }, 30000); // 30 second delay
        } else {
          // Notify users when maintenance ends
          io.emit('system:maintenance-ended', {
            message: 'Maintenance mode has ended. All services are now available.',
            timestamp: new Date(),
            featuresRestored: ['Chat', 'File Upload', 'User Registration']
          });
          
          logger.info('Maintenance mode ended - all services restored');
        }
      } catch (socketError) {
        logger.warn('Socket IO not available for maintenance notification:', socketError);
        // Continue without socket notification
      }
      
      return {
        maintenanceMode: enabled,
        enabledAt: new Date(),
        message: enabled ? 'System is now in maintenance mode' : 'System is now operational'
      };
    } catch (error) {
      await transaction.rollback();
      logger.error('Toggle maintenance error:', error);
      throw error;
    }
  }

  async createBackup() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(process.cwd(), 'backups');
      const backupPath = path.join(backupDir, `backup-${timestamp}.sql`);
      
      // Ensure backup directory exists
      await fs.mkdir(backupDir, { recursive: true });
      
      // Get database configuration from environment
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'chat_db'
      };
      
      logger.info('Starting database backup...');
      
      // Create mysqldump command
      const mysqldumpCommand = `mysqldump -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.user} -p${dbConfig.password} --single-transaction --routines --triggers --events ${dbConfig.database} > "${backupPath}"`;
      
      // Execute backup command
      try {
        await execAsync(mysqldumpCommand);
        logger.info(`Database backup created: ${backupPath}`);
        
        // Get file size
        const stats = await fs.stat(backupPath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        // Broadcast backup notification to all users
        const io = getIO();
        io.emit('system:backup', {
          status: 'completed',
          backupPath: path.basename(backupPath),
          size: `${fileSizeInMB}MB`,
          message: 'System backup has been completed successfully',
          timestamp: new Date()
        });

        return {
          backupPath: path.basename(backupPath),
          timestamp: new Date(),
          size: `${fileSizeInMB}MB`,
          status: 'completed'
        };
      } catch (execError) {
        logger.error('Database backup command failed:', execError);
        
        // Fallback to basic backup if mysqldump fails
        await this.createBasicBackup(backupPath, timestamp);
        
        const stats = await fs.stat(backupPath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        const io = getIO();
        io.emit('system:backup', {
          status: 'completed',
          backupPath: path.basename(backupPath),
          size: `${fileSizeInMB}MB`,
          message: 'System backup completed (basic format)',
          timestamp: new Date()
        });

        return {
          backupPath: path.basename(backupPath),
          timestamp: new Date(),
          size: `${fileSizeInMB}MB`,
          status: 'completed'
        };
      }
    } catch (error) {
      logger.error('Create backup error:', error);
      throw error;
    }
  }

  // Fallback basic backup method
  async createBasicBackup(backupPath, timestamp) {
    try {
      const fs = require('fs').promises;
      
      // Export critical data as JSON
      const backupData = {
        timestamp,
        version: '1.0',
        data: {
          users: await this.backupUsers(),
          chats: await this.backupChats(),
          messages: await this.backupMessages(),
          systemSettings: await this.backupSystemSettings()
        }
      };
      
      await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
      logger.info(`Basic backup created: ${backupPath}`);
    } catch (error) {
      logger.error('Basic backup failed:', error);
      throw error;
    }
  }

  // Helper methods for basic backup
  async backupUsers() {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    return users.map(user => user.toJSON());
  }

  async backupChats() {
    const chats = await Chat.findAll();
    return chats.map(chat => chat.toJSON());
  }

  async backupMessages() {
    const messages = await Message.findAll({
      limit: 1000, // Limit to prevent huge backups
      order: [['createdAt', 'DESC']]
    });
    return messages.map(message => message.toJSON());
  }

  async backupSystemSettings() {
    const settings = await SystemSetting.findAll();
    return settings.map(setting => setting.toJSON());
  }

  async clearCache() {
    try {
      let itemsCleared = 0;
      
      // Clear application-level caches
      // 1. Clear any in-memory caches (if using node-cache or similar)
      if (global.appCache) {
        const keys = global.appCache.keys();
        global.appCache.flushAll();
        itemsCleared += keys.length;
        logger.info(`Cleared ${keys.length} items from application cache`);
      }
      
      // 2. Clear Redis cache if available
      try {
        const redis = require('redis');
        const redisClient = redis.createClient({
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD || undefined
        });
        
        await redisClient.connect();
        const redisKeys = await redisClient.flushDb();
        await redisClient.disconnect();
        itemsCleared += parseInt(redisKeys) || 0;
        logger.info('Cleared Redis cache');
      } catch (redisError) {
        logger.info('Redis not available, skipping Redis cache clear');
      }
      
      // 3. Clear session store if using connect-redis or similar
      try {
        // Clear expired sessions from database
        const { sequelize } = require('../models');
        const [results] = await sequelize.query(`
          DELETE FROM sessions WHERE expires < NOW()
        `);
        itemsCleared += results || 0;
        logger.info(`Cleared ${results || 0} expired sessions`);
      } catch (sessionError) {
        logger.info('Session cleanup failed or not available');
      }
      
      // 4. Force cache invalidation for all connected clients
      const io = getIO();
      
      // Broadcast cache clearing to all users with detailed information
      io.emit('system:cache-cleared', {
        message: 'System cache has been cleared. You may experience improved performance.',
        itemsCleared,
        timestamp: new Date(),
        details: {
          applicationCache: itemsCleared > 0,
          redisCache: true,
          sessions: true
        }
      });

      // Force refresh for all connected clients after a short delay
      setTimeout(() => {
        io.emit('force:refresh', {
          reason: 'cache-cleared',
          message: 'Cache cleared. Please refresh to see the latest data.',
          urgency: 'low'
        });
      }, 1000);
      
      logger.info(`Cache clearing completed. Total items cleared: ${itemsCleared}`);
      
      return {
        clearedAt: new Date(),
        itemsCleared,
        message: 'System cache cleared successfully',
        details: {
          applicationCache: true,
          redisCache: true,
          sessions: true
        }
      };
    } catch (error) {
      logger.error('Clear cache error:', error);
      throw error;
    }
  }

  // Admin management methods
  async getAdmins() {
    try {
      const admins = await User.findAll({
        where: { role: 'ADMIN' },
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']]
      });
      return admins;
    } catch (error) {
      logger.error('Get admins error:', error);
      throw error;
    }
  }

  async createAdmin({ username, email, password }) {
    try {
      // Check if email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Check if username already exists
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        throw new Error('Username already exists');
      }

      const admin = await User.create({
        username,
        email,
        password,
        role: 'ADMIN',
        isOnline: false,
        presenceStatus: 'OFFLINE'
      });

      // Log admin creation
      await this.logAdminActivity(admin.id, 'admin_created', `Admin ${username} was created`);

      logger.info(`Admin created: ${admin.email}`);
      return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt
      };
    } catch (error) {
      logger.error('Create admin error:', error);
      throw error;
    }
  }

  async deleteAdmin(adminId) {
    try {
      const admin = await User.findOne({
        where: { id: adminId, role: 'ADMIN' }
      });

      if (!admin) {
        throw new Error('Admin not found');
      }

      // Log admin deletion before deleting
      await this.logAdminActivity(adminId, 'admin_deleted', `Admin ${admin.username} was deleted`);

      await admin.destroy();
      logger.info(`Admin deleted: ${adminId}`);
    } catch (error) {
      logger.error('Delete admin error:', error);
      throw error;
    }
  }

  async toggleAdminSuspend(adminId, suspended) {
    try {
      const admin = await User.findOne({
        where: { id: adminId, role: 'ADMIN' }
      });

      if (!admin) {
        throw new Error('Admin not found');
      }

      await admin.update({ suspended });

      // Log suspension toggle
      await this.logAdminActivity(
        adminId,
        suspended ? 'admin_suspended' : 'admin_unsuspended',
        `Admin ${admin.username} was ${suspended ? 'suspended' : 'unsuspended'}`
      );

      logger.info(`Admin ${suspended ? 'suspended' : 'unsuspended'}: ${adminId}`);
      return {
        id: admin.id,
        username: admin.username,
        suspended: admin.suspended
      };
    } catch (error) {
      logger.error('Toggle admin suspend error:', error);
      throw error;
    }
  }

  async getAdminLogs(adminId) {
    try {
      // For now, return mock logs. In production, you'd have an AdminActivityLog model
      const logs = [
        {
          type: 'login',
          action: 'Admin Login',
          description: 'Admin logged into the system',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          type: 'action',
          action: 'System Settings Updated',
          description: 'Modified system configuration',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          type: 'logout',
          action: 'Admin Logout',
          description: 'Admin logged out of the system',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      return logs;
    } catch (error) {
      logger.error('Get admin logs error:', error);
      throw error;
    }
  }

  async logAdminActivity(adminId, action, description) {
    try {
      // In production, save to AdminActivityLog table
      logger.info(`Admin Activity - ${action}: ${description}`);
    } catch (error) {
      logger.error('Log admin activity error:', error);
    }
  }
}

module.exports = new AdminService();

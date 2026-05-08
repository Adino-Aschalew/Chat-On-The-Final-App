const { verifyToken } = require('../utils/generateToken');
const { User, ChatMember, Message, MessageRead } = require('../models');
const { logger } = require('../middleware/error.middleware');

class ChatSocket {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> socket.id
    this.userSockets = new Map(); // socket.id -> userId
    this.typingUsers = new Map(); // chatId -> Set of userIds typing
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = verifyToken(token);
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.user = user;
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication error'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const user = socket.user;
      
      logger.info(`User connected: ${user.id} (${user.username})`);

      // Store user connection
      this.connectedUsers.set(user.id, socket.id);
      this.userSockets.set(socket.id, user.id);

      // Update user online status
      this.updateUserStatus(user.id, true, 'ONLINE');

      // Join user to their personal room for notifications
      socket.join(`user:${user.id}`);

      // Handle joining chat rooms
      socket.on('join_chat', async (data) => {
        await this.handleJoinChat(socket, data);
      });

      // Handle leaving chat rooms
      socket.on('leave_chat', async (data) => {
        await this.handleLeaveChat(socket, data);
      });

      // Handle sending messages
      socket.on('send_message', async (data) => {
        await this.handleSendMessage(socket, data);
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        this.handleTypingStart(socket, data);
      });

      socket.on('typing_stop', (data) => {
        this.handleTypingStop(socket, data);
      });

      // Handle message read
      socket.on('message_read', async (data) => {
        await this.handleMessageRead(socket, data);
      });

      // Handle user status changes
      socket.on('change_status', async (data) => {
        await this.handleChangeStatus(socket, data);
      });

      // Handle profile updates
      socket.on('profile_updated', async (data) => {
        await this.handleProfileUpdated(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`Socket error for user ${user.id}:`, error);
      });
    });
  }

  async handleJoinChat(socket, data) {
    try {
      const { chatId } = data;
      const user = socket.user;

      // Check if user is a member of the chat
      const membership = await ChatMember.findOne({
        where: { chatId, userId: user.id }
      });

      if (!membership) {
        socket.emit('error', { message: 'Not a member of this chat' });
        return;
      }

      // Join chat room
      socket.join(`chat:${chatId}`);

      // Mark chat as read
      await ChatMember.update(
        { lastReadAt: new Date() },
        { where: { chatId, userId: user.id } }
      );

      // Notify the user to refresh their chats list (to clear unread count)
      socket.emit('chats_updated');

      // Notify other members
      socket.to(`chat:${chatId}`).emit('user_joined', {
        chatId,
        user: user.toSafeObject()
      });

      // Send current typing users for this chat
      const typingUsers = this.typingUsers.get(chatId) || new Set();
      if (typingUsers.size > 0) {
        const typingUserIds = Array.from(typingUsers);
        const typingUsersData = await User.findAll({
          where: { id: typingUserIds },
          attributes: ['id', 'username', 'avatar']
        });

        socket.emit('typing_users', {
          chatId,
          users: typingUsersData
        });
      }

      logger.info(`User ${user.id} joined chat ${chatId}`);
    } catch (error) {
      logger.error('Join chat error:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  }

  async handleLeaveChat(socket, data) {
    try {
      const { chatId } = data;
      const user = socket.user;

      // Leave chat room
      socket.leave(`chat:${chatId}`);

      // Notify other members
      socket.to(`chat:${chatId}`).emit('user_left', {
        chatId,
        user: user.toSafeObject()
      });

      // Remove user from typing list for this chat
      const typingUsers = this.typingUsers.get(chatId);
      if (typingUsers) {
        typingUsers.delete(user.id);
        if (typingUsers.size === 0) {
          this.typingUsers.delete(chatId);
        }
      }

      logger.info(`User ${user.id} left chat ${chatId}`);
    } catch (error) {
      logger.error('Leave chat error:', error);
      socket.emit('error', { message: 'Failed to leave chat' });
    }
  }

  async handleSendMessage(socket, data) {
    try {
      const { chatId } = data;
      const user = socket.user;

      // Check if user is a member of the chat
      const membership = await ChatMember.findOne({
        where: { chatId, userId: user.id }
      });

      if (!membership) {
        socket.emit('error', { message: 'Not a member of this chat' });
        return;
      }

      // Broadcast message to other chat members in the room
      socket.to(`chat:${chatId}`).emit('receive_message', data);

      // Send notifications to off-screen members
      const chatMembers = await ChatMember.findAll({
        where: { chatId },
        include: [{ model: User, as: 'user', attributes: ['id'] }]
      });

      chatMembers.forEach(member => {
        if (member.userId !== user.id) {
          this.io.to(`user:${member.userId}`).emit('new_message_notification', {
            chatId,
            message: data,
            sender: user.toSafeObject()
          });
        }
      });

      logger.info(`Message broadcasted in chat ${chatId} by user ${user.id}`);
    } catch (error) {
      logger.error('Socket message broadcast error:', error);
      socket.emit('error', { message: 'Failed to broadcast message' });
    }
  }

  handleTypingStart(socket, data) {
    try {
      const { chatId } = data;
      const user = socket.user;

      if (!this.typingUsers.has(chatId)) {
        this.typingUsers.set(chatId, new Set());
      }

      this.typingUsers.get(chatId).add(user.id);

      // Notify other chat members
      socket.to(`chat:${chatId}`).emit('typing_start', {
        chatId,
        user: user.toSafeObject()
      });

      logger.info(`User ${user.id} started typing in chat ${chatId}`);
    } catch (error) {
      logger.error('Typing start error:', error);
    }
  }

  handleTypingStop(socket, data) {
    try {
      const { chatId } = data;
      const user = socket.user;

      const typingUsers = this.typingUsers.get(chatId);
      if (typingUsers) {
        typingUsers.delete(user.id);
        if (typingUsers.size === 0) {
          this.typingUsers.delete(chatId);
        }
      }

      // Notify other chat members
      socket.to(`chat:${chatId}`).emit('typing_stop', {
        chatId,
        user: user.toSafeObject()
      });

      logger.info(`User ${user.id} stopped typing in chat ${chatId}`);
    } catch (error) {
      logger.error('Typing stop error:', error);
    }
  }

  async handleMessageRead(socket, data) {
    try {
      const { messageId } = data;
      const user = socket.user;

      // Create or update read receipt
      const [readReceipt, created] = await MessageRead.findOrCreate({
        where: {
          messageId,
          userId: user.id
        },
        defaults: {
          readAt: new Date()
        }
      });

      if (!created) {
        await readReceipt.update({ readAt: new Date() });
      }

      // Get message details
      const message = await Message.findByPk(messageId, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username']
          }
        ]
      });

      if (message) {
        // Notify message sender
        this.io.to(`user:${message.senderId}`).emit('message_read_notification', {
          messageId,
          readBy: user.toSafeObject(),
          readAt: readReceipt.readAt
        });
      }

      logger.info(`Message ${messageId} marked as read by user ${user.id}`);
    } catch (error) {
      logger.error('Message read error:', error);
      socket.emit('error', { message: 'Failed to mark message as read' });
    }
  }

  async handleChangeStatus(socket, data) {
    try {
      const { status } = data;
      const user = socket.user;

      if (!['ONLINE', 'AWAY', 'BUSY', 'INVISIBLE'].includes(status)) {
        socket.emit('error', { message: 'Invalid status' });
        return;
      }

      await this.updateUserStatus(user.id, true, status);

      // Notify all connected users about status change
      socket.broadcast.emit('user_status_changed', {
        userId: user.id,
        status,
        user: user.toSafeObject()
      });

      logger.info(`User ${user.id} changed status to ${status}`);
    } catch (error) {
      logger.error('Change status error:', error);
      socket.emit('error', { message: 'Failed to change status' });
    }
  }

  async handleProfileUpdated(socket, data) {
    try {
      const user = socket.user;

      // Refresh user data from database to get latest avatar
      const updatedUser = await User.findByPk(user.id);
      if (updatedUser) {
        socket.user = updatedUser;
      }

      // Notify all connected users about profile update
      socket.broadcast.emit('user_profile_updated', {
        userId: user.id,
        user: updatedUser ? updatedUser.toSafeObject() : user.toSafeObject()
      });

      logger.info(`User ${user.id} profile updated`);
    } catch (error) {
      logger.error('Profile update error:', error);
      socket.emit('error', { message: 'Failed to broadcast profile update' });
    }
  }

  async handleDisconnect(socket) {
    try {
      const user = socket.user;
      
      logger.info(`User disconnected: ${user.id} (${user.username})`);

      // Remove user from connected users
      this.connectedUsers.delete(user.id);
      this.userSockets.delete(socket.id);

      // Remove user from all typing lists
      this.typingUsers.forEach((typingUsers, chatId) => {
        if (typingUsers.has(user.id)) {
          typingUsers.delete(user.id);
          if (typingUsers.size === 0) {
            this.typingUsers.delete(chatId);
          }
          
          // Notify chat members that user stopped typing
          socket.to(`chat:${chatId}`).emit('typing_stop', {
            chatId,
            user: user.toSafeObject()
          });
        }
      });

      // Update user offline status
      await this.updateUserStatus(user.id, false, 'OFFLINE');

      // Notify all connected users about user going offline
      socket.broadcast.emit('user_status_changed', {
        userId: user.id,
        status: 'OFFLINE',
        user: user.toSafeObject()
      });

    } catch (error) {
      logger.error('Disconnect error:', error);
    }
  }

  async updateUserStatus(userId, isOnline, status) {
    try {
      await User.update(
        {
          isOnline,
          lastSeen: new Date(),
          presenceStatus: status
        },
        { where: { id: userId } }
      );
    } catch (error) {
      logger.error('Update user status error:', error);
    }
  }

  // Utility method to send notification to specific user
  sendToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Utility method to send to chat room
  sendToChat(chatId, event, data) {
    this.io.to(`chat:${chatId}`).emit(event, data);
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.connectedUsers.size;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

module.exports = ChatSocket;

const { Message, MessageRead, ChatMember, Chat, User, MessageReaction, sequelize } = require('../models');
const { logger } = require('../middleware/error.middleware');
const { Op } = require('sequelize');

class MessageService {
  async sendMessage(messageData, userId) {
    const { 
      chatId, 
      content, 
      replyToId, 
      messageType = 'TEXT', 
      fileUrl, 
      fileName, 
      fileSize,
      isForwarded = false,
      forwardedFromId = null
    } = messageData;

    // Check if user is a member of the chat
    const membership = await ChatMember.findOne({
      where: { chatId, userId }
    });

    if (!membership) {
      throw new Error('Access denied. Not a member of this chat.');
    }

    // Create message
    const transaction = await sequelize.transaction();
    try {
      const message = await Message.create({
        chatId,
        senderId: userId,
        content,
        replyToId,
        messageType,
        fileUrl,
        fileName,
        fileSize,
        isForwarded,
        forwardedFromId,
        isDelivered: true,
        deliveredAt: new Date()
      }, { transaction });

      // Update chat's last message time
      await Chat.update(
        { lastMessageAt: new Date() },
        { where: { id: chatId }, transaction }
      );

      // Update member's last read time
      await ChatMember.update(
        { lastReadAt: new Date() },
        { where: { chatId, userId }, transaction }
      );

      await transaction.commit();

      // Fetch complete message with associations
      const completeMessage = await this.getMessageById(message.id, userId);

      logger.info(`Message sent: ${message.id} in chat: ${chatId} by user: ${userId}`);

      return completeMessage;
    } catch (error) {
      await transaction.rollback();
      logger.error('Send message error:', error);
      throw error;
    }
  }

  async getChatMessages(chatId, userId, page = 1, limit = 50) {
    try {
      // Check if user is a member of the chat
      const membership = await ChatMember.findOne({
        where: {
          chatId,
          userId
        }
      });

      if (!membership) {
        throw new Error('Access denied. Not a member of this chat.');
      }

      const offset = (page - 1) * limit;

      const messages = await Message.findAll({
        where: {
          chatId,
          isDeleted: false
        },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'avatar']
          },
          {
            model: Message,
            as: 'replyTo',
            include: [
              {
                model: User,
                as: 'sender',
                attributes: ['id', 'username']
              }
            ]
          },
          {
            model: MessageReaction,
            as: 'reactions',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username']
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      const total = await Message.count({
        where: {
          chatId,
          isDeleted: false
        }
      });

      return {
        messages: messages.reverse(), // Return in chronological order
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get chat messages error:', error);
      throw error;
    }
  }

  async getMessageById(messageId, userId) {
    try {
      const message = await Message.findOne({
        where: {
          id: messageId,
          isDeleted: false
        },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'avatar']
          },
          {
            model: Chat,
            as: 'chat',
            include: [
              {
                model: ChatMember,
                as: 'members',
                where: { userId },
                required: true
              }
            ]
          },
          {
            model: Message,
            as: 'replyTo',
            include: [
              {
                model: User,
                as: 'sender',
                attributes: ['id', 'username']
              }
            ]
          },
          {
            model: MessageReaction,
            as: 'reactions',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username']
              }
            ]
          }
        ]
      });

      if (!message) {
        throw new Error('Message not found or access denied');
      }

      return message;
    } catch (error) {
      logger.error('Get message by ID error:', error);
      throw error;
    }
  }

  async editMessage(messageId, content, userId) {
    try {
      const message = await Message.findByPk(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      if (message.senderId !== userId) {
        throw new Error('Access denied. You can only edit your own messages.');
      }

      if (message.isDeleted) {
        throw new Error('Cannot edit deleted message');
      }

      // Store original content if not already stored
      const updateData = {
        content,
        isEdited: true,
        editedAt: new Date()
      };

      if (!message.originalContent) {
        updateData.originalContent = message.content;
      }

      await message.update(updateData);

      logger.info(`Message edited: ${messageId} by user: ${userId}`);

      return await this.getMessageById(messageId, userId);
    } catch (error) {
      logger.error('Edit message error:', error);
      throw error;
    }
  }

  async deleteMessage(messageId, userId) {
    try {
      const message = await Message.findByPk(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      if (message.senderId !== userId) {
        throw new Error('Access denied. You can only delete your own messages.');
      }

      if (message.isDeleted) {
        throw new Error('Message already deleted');
      }

      await message.update({
        isDeleted: true,
        deletedAt: new Date(),
        content: 'This message has been deleted'
      });

      logger.info(`Message deleted: ${messageId} by user: ${userId}`);

      return { message: 'Message deleted successfully' };
    } catch (error) {
      logger.error('Delete message error:', error);
      throw error;
    }
  }

  async markAsRead(messageId, userId) {
    try {
      const message = await Message.findByPk(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      // Check if user is a member of the chat
      const membership = await ChatMember.findOne({
        where: {
          chatId: message.chatId,
          userId
        }
      });

      if (!membership) {
        throw new Error('Access denied. Not a member of this chat.');
      }

      // Create or update read receipt
      const [readReceipt, created] = await MessageRead.findOrCreate({
        where: {
          messageId,
          userId
        },
        defaults: {
          readAt: new Date()
        }
      });

      if (!created) {
        await readReceipt.update({ readAt: new Date() });
      }

      // Update member's last read time
      await ChatMember.update(
        { lastReadAt: new Date() },
        { where: { chatId: message.chatId, userId } }
      );

      logger.info(`Message marked as read: ${messageId} by user: ${userId}`);

      return readReceipt;
    } catch (error) {
      logger.error('Mark as read error:', error);
      throw error;
    }
  }

  async markChatAsRead(chatId, userId) {
    try {
      // Check if user is a member of the chat
      const membership = await ChatMember.findOne({
        where: {
          chatId,
          userId
        }
      });

      if (!membership) {
        throw new Error('Access denied. Not a member of this chat.');
      }

      // Get all unread messages for this user in this chat
      const unreadMessages = await Message.findAll({
        where: {
          chatId,
          senderId: { [Op.ne]: userId }, // Not sent by this user
          isDeleted: false
        },
        include: [
          {
            model: MessageRead,
            as: 'reads',
            where: { userId },
            required: false
          }
        ]
      });

      // Mark all as read
      const readPromises = unreadMessages.map(message => {
        if (!message.reads || message.reads.length === 0) {
          return MessageRead.create({
            messageId: message.id,
            userId,
            readAt: new Date()
          });
        }
        return Promise.resolve();
      });

      await Promise.all(readPromises);

      // Update member's last read time
      await ChatMember.update(
        { lastReadAt: new Date() },
        { where: { chatId, userId } }
      );

      logger.info(`Chat marked as read: ${chatId} by user: ${userId}`);

      return { message: 'All messages marked as read' };
    } catch (error) {
      logger.error('Mark chat as read error:', error);
      throw error;
    }
  }

  async getUnreadCount(chatId, userId) {
    try {
      const membership = await ChatMember.findOne({
        where: {
          chatId,
          userId
        }
      });

      if (!membership) {
        throw new Error('Access denied. Not a member of this chat.');
      }

      const unreadCount = await Message.count({
        where: {
          chatId,
          senderId: { [Op.ne]: userId },
          isDeleted: false,
          createdAt: {
            [Op.gt]: membership.lastReadAt || new Date(0)
          }
        },
        include: [
          {
            model: MessageRead,
            as: 'reads',
            where: { userId },
            required: false
          }
        ]
      });

      logger.info(`Unread count fetched: ${chatId} for user: ${userId}`);
      return unreadCount;
    } catch (error) {
      logger.error('Get unread count error:', error);
      throw error;
    }
  }

  async clearChatHistory(chatId, userId) {
    try {
      const membership = await ChatMember.findOne({
        where: { chatId, userId }
      });

      if (!membership) {
        throw new Error('Access denied. Not a member of this chat.');
      }

      // Soft delete all messages in this chat
      await Message.update(
        { isDeleted: true, deletedAt: new Date() },
        { where: { chatId } }
      );

      logger.info(`Chat history cleared: ${chatId} by user: ${userId}`);
      return { message: 'Chat history cleared successfully' };
    } catch (error) {
      logger.error('Clear chat history error:', error);
      throw error;
    }
  }

  async getReadReceipts(messageId, userId) {
    try {
      const message = await Message.findByPk(messageId);
      if (!message) throw new Error('Message not found');

      // Check membership
      const membership = await ChatMember.findOne({ where: { chatId: message.chatId, userId } });
      if (!membership) throw new Error('Access denied');

      const reads = await MessageRead.findAll({
        where: { messageId },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar', 'isOnline']
        }],
        order: [['readAt', 'DESC']]
      });

      return reads;
    } catch (error) {
      logger.error('Get read receipts error:', error);
      throw error;
    }
  }
}

module.exports = new MessageService();

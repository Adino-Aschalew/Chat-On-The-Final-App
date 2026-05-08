const { Chat, ChatMember, User, Message, sequelize } = require('../models');
const { logger } = require('../middleware/error.middleware');
const { Op } = require('sequelize');

class ChatService {
  async createChat(chatData, userId) {
    const { name, type, memberIds, description } = chatData;

    // Check if private chat already exists
    if (type === 'PRIVATE' && memberIds && memberIds.length === 1) {
      const targetUserId = memberIds[0];
      
      // Find a private chat where both users are members
      const myPrivateChatMemberships = await ChatMember.findAll({
        where: { userId },
        include: [{
          model: Chat,
          as: 'chat',
          where: { type: 'PRIVATE' }
        }]
      });

      const chatIds = myPrivateChatMemberships.map(m => m.chatId);
      
      if (chatIds.length > 0) {
        const commonMembership = await ChatMember.findOne({
          where: {
            chatId: chatIds,
            userId: targetUserId
          }
        });

        if (commonMembership) {
          return await this.getChatById(commonMembership.chatId, userId);
        }
      }
    }

    // Create chat
    const transaction = await sequelize.transaction();
    try {
      const chat = await Chat.create({
        name: type === 'PRIVATE' ? null : name,
        type,
        description,
        memberCount: memberIds ? memberIds.length + 1 : 1
      }, { transaction });

      // Add creator as member
      await ChatMember.create({
        userId,
        chatId: chat.id,
        role: 'ADMIN'
      }, { transaction });

      // Add other members if provided
      if (memberIds && memberIds.length > 0) {
        const members = memberIds.map(memberId => ({
          userId: memberId,
          chatId: chat.id,
          role: 'MEMBER'
        }));

        await ChatMember.bulkCreate(members, { transaction });
        
        // Update member count
        await chat.update({ memberCount: memberIds.length + 1 }, { transaction });
      }

      await transaction.commit();

      // Fetch chat with members
      const chatWithMembers = await this.getChatById(chat.id, userId);

      logger.info(`Chat created: ${chat.id} by user: ${userId}`);

      return chatWithMembers;
    } catch (error) {
      await transaction.rollback();
      logger.error('Create chat error:', error);
      throw error;
    }
  }

  async getUserChats(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const chats = await Chat.findAll({
        include: [
          {
            model: ChatMember,
            as: 'members',
            where: { userId },
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'avatar', 'isOnline', 'presenceStatus']
              }
            ]
          },
          {
            model: Message,
            as: 'messages',
            limit: 1,
            order: [['createdAt', 'DESC']],
            include: [
              {
                model: User,
                as: 'sender',
                attributes: ['id', 'username', 'avatar']
              }
            ]
          }
        ],
        order: [['lastMessageAt', 'DESC']],
        limit,
        offset
      });

      // Enhance chats with unreadCount and metadata
      const enhancedChats = await Promise.all(chats.map(async (chat) => {
        const chatJSON = chat.get({ plain: true });
        
        // Find current user's membership
        const userMembership = chat.members?.find(m => m.userId === userId);
        const lastReadAt = userMembership?.lastReadAt || new Date(0);

        // Count unread messages
        const unreadCount = await Message.count({
          where: {
            chatId: chat.id,
            senderId: { [Op.ne]: userId },
            isDeleted: false,
            createdAt: { [Op.gt]: lastReadAt }
          }
        });

        chatJSON.unreadCount = unreadCount;
        
        // Add otherMember for private chats for easier UI rendering
        if (chat.type === 'PRIVATE') {
          const otherMember = chat.members?.find(m => m.userId !== userId);
          chatJSON.otherMember = otherMember?.user || null;
        }

        return chatJSON;
      }));

      const total = await Chat.count({
        include: [
          {
            model: ChatMember,
            as: 'members',
            where: { userId }
          }
        ]
      });

      return {
        chats: enhancedChats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get user chats error:', error);
      throw error;
    }
  }

  async getChatById(chatId, userId) {
    try {
      const chat = await Chat.findOne({
        where: { id: chatId },
        include: [
          {
            model: ChatMember,
            as: 'members',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email', 'avatar', 'isOnline', 'presenceStatus', 'lastSeen']
              }
            ]
          },
          {
            model: Message,
            as: 'pinnedMessage',
            include: [
              {
                model: User,
                as: 'sender',
                attributes: ['id', 'username', 'avatar']
              }
            ]
          }
        ]
      });

      if (!chat) {
        throw new Error('Chat not found');
      }

      // Check if user is a member
      const isMember = chat.members.some(member => member.userId === userId);
      if (!isMember) {
        throw new Error('Access denied. Not a member of this chat.');
      }

      return chat;
    } catch (error) {
      logger.error('Get chat by ID error:', error);
      throw error;
    }
  }

  async updateChat(chatId, updateData, userId) {
    try {
      const chat = await Chat.findByPk(chatId);
      
      if (!chat) {
        throw new Error('Chat not found');
      }

      // Check if user is admin or creator
      const membership = await ChatMember.findOne({
        where: {
          chatId,
          userId,
          role: 'ADMIN'
        }
      });

      if (!membership && userId !== chat.createdBy) {
        throw new Error('Access denied. Only admins can update chat.');
      }

      await chat.update(updateData);

      logger.info(`Chat updated: ${chatId} by user: ${userId}`);

      return await this.getChatById(chatId, userId);
    } catch (error) {
      logger.error('Update chat error:', error);
      throw error;
    }
  }

  async deleteChat(chatId, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      const chat = await Chat.findByPk(chatId);
      
      if (!chat) {
        throw new Error('Chat not found');
      }

      // Check if user is admin
      const membership = await ChatMember.findOne({
        where: {
          chatId,
          userId,
          role: 'ADMIN'
        }
      });

      if (!membership) {
        throw new Error('Access denied. Only admins can delete chat.');
      }

      // Delete all related data
      await ChatMember.destroy({ where: { chatId }, transaction });
      await Message.destroy({ where: { chatId }, transaction });
      await Chat.destroy({ where: { id: chatId }, transaction });

      await transaction.commit();

      logger.info(`Chat deleted: ${chatId} by user: ${userId}`);

      return { message: 'Chat deleted successfully' };
    } catch (error) {
      await transaction.rollback();
      logger.error('Delete chat error:', error);
      throw error;
    }
  }

  async addMember(chatId, memberIds, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      // Check if user is admin
      const membership = await ChatMember.findOne({
        where: {
          chatId,
          userId,
          role: 'ADMIN'
        }
      });

      if (!membership) {
        throw new Error('Access denied. Only admins can add members.');
      }

      // Check if members already exist
      const existingMembers = await ChatMember.findAll({
        where: {
          chatId,
          userId: memberIds
        }
      });

      const existingMemberIds = existingMembers.map(m => m.userId);
      const newMemberIds = memberIds.filter(id => !existingMemberIds.includes(id));

      if (newMemberIds.length === 0) {
        throw new Error('All users are already members of this chat');
      }

      // Add new members
      const members = newMemberIds.map(memberId => ({
        userId: memberId,
        chatId,
        role: 'MEMBER'
      }));

      await ChatMember.bulkCreate(members, { transaction });

      // Update member count
      const chat = await Chat.findByPk(chatId);
      await chat.update({
        memberCount: chat.memberCount + newMemberIds.length
      }, { transaction });

      await transaction.commit();

      logger.info(`Members added to chat ${chatId}: ${newMemberIds.join(', ')}`);

      return await this.getChatById(chatId, userId);
    } catch (error) {
      await transaction.rollback();
      logger.error('Add member error:', error);
      throw error;
    }
  }

  async removeMember(chatId, memberId, userId) {
    try {
      // Check if user is admin
      const membership = await ChatMember.findOne({
        where: {
          chatId,
          userId,
          role: 'ADMIN'
        }
      });

      if (!membership) {
        throw new Error('Access denied. Only admins can remove members.');
      }

      // Remove member
      const removed = await ChatMember.destroy({
        where: {
          chatId,
          userId: memberId
        }
      });

      if (removed === 0) {
        throw new Error('User is not a member of this chat');
      }

      // Update member count
      const chat = await Chat.findByPk(chatId);
      await chat.update({
        memberCount: Math.max(0, chat.memberCount - 1)
      });

      logger.info(`Member removed from chat ${chatId}: ${memberId}`);

      return { message: 'Member removed successfully' };
    } catch (error) {
      logger.error('Remove member error:', error);
      throw error;
    }
  }

  async leaveChat(chatId, userId) {
    try {
      const membership = await ChatMember.findOne({
        where: {
          chatId,
          userId
        }
      });

      if (!membership) {
        throw new Error('You are not a member of this chat');
      }

      await ChatMember.destroy({
        where: {
          chatId,
          userId
        }
      });

      // Update member count
      const chat = await Chat.findByPk(chatId);
      await chat.update({
        memberCount: Math.max(0, chat.memberCount - 1)
      });

      logger.info(`User left chat ${chatId}: ${userId}`);

      return { message: 'Left chat successfully' };
    } catch (error) {
      logger.error('Leave chat error:', error);
      throw error;
    }
  }
  
  async pinMessage(chatId, messageId, userId) {
    try {
      const chat = await Chat.findByPk(chatId);
      if (!chat) throw new Error('Chat not found');

      // Check if user is member
      const membership = await ChatMember.findOne({ where: { chatId, userId } });
      if (!membership) throw new Error('Access denied');

      // Check if message belongs to chat
      const message = await Message.findOne({ where: { id: messageId, chatId } });
      if (!message) throw new Error('Message not found in this chat');

      await chat.update({ pinnedMessageId: messageId });
      
      return await this.getChatById(chatId, userId);
    } catch (error) {
      logger.error('Pin message error:', error);
      throw error;
    }
  }

  async unpinMessage(chatId, userId) {
    try {
      const chat = await Chat.findByPk(chatId);
      if (!chat) throw new Error('Chat not found');

      // Check if user is admin
      const membership = await ChatMember.findOne({ where: { chatId, userId, role: 'ADMIN' } });
      if (!membership && chat.type !== 'PRIVATE') throw new Error('Access denied');

      await chat.update({ pinnedMessageId: null });
      
      return await this.getChatById(chatId, userId);
    } catch (error) {
      logger.error('Unpin message error:', error);
      throw error;
    }
  }
}

module.exports = new ChatService();

const { ScheduledMessage, Message, ChatMember, User } = require('../models');
const { logger } = require('../middleware/error.middleware');
const { Op } = require('sequelize');
const moment = require('moment');

class ScheduledMessageService {
  /**
   * Schedule a new message
   */
  async scheduleMessage(userId, chatId, messageData) {
    try {
      // Check if user is member of chat
      const membership = await ChatMember.findOne({
        where: { chatId, userId }
      });

      if (!membership) {
        throw new Error('Not a member of this chat');
      }

      const scheduledMessage = await ScheduledMessage.create({
        senderId: userId,
        chatId,
        content: messageData.content,
        scheduledFor: messageData.scheduledFor,
        messageType: messageData.messageType || 'TEXT',
        fileUrl: messageData.fileUrl,
        fileName: messageData.fileName,
        fileSize: messageData.fileSize,
        isRecurring: messageData.isRecurring || false,
        recurringPattern: messageData.recurringPattern,
        recurringEndDate: messageData.recurringEndDate,
        status: 'PENDING'
      });

      return scheduledMessage;
    } catch (error) {
      logger.error('Schedule message error:', error);
      throw error;
    }
  }

  /**
   * Get scheduled messages for a user
   */
  async getUserScheduledMessages(userId, chatId = null) {
    try {
      const where = { senderId: userId, status: 'PENDING' };
      if (chatId) where.chatId = chatId;

      return await ScheduledMessage.findAll({
        where,
        order: [['scheduledFor', 'ASC']]
      });
    } catch (error) {
      logger.error('Get user scheduled messages error:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled message
   */
  async cancelScheduledMessage(userId, scheduledMessageId) {
    try {
      const scheduledMessage = await ScheduledMessage.findOne({
        where: { id: scheduledMessageId, senderId: userId }
      });

      if (!scheduledMessage) {
        throw new Error('Scheduled message not found or unauthorized');
      }

      if (scheduledMessage.status !== 'PENDING') {
        throw new Error(`Cannot cancel message with status ${scheduledMessage.status}`);
      }

      await scheduledMessage.update({ status: 'CANCELLED' });
      return scheduledMessage;
    } catch (error) {
      logger.error('Cancel scheduled message error:', error);
      throw error;
    }
  }

  /**
   * Process pending scheduled messages
   * This should be called by a cron job
   */
  async processScheduledMessages(io) {
    try {
      const now = new Date();
      const pendingMessages = await ScheduledMessage.findAll({
        where: {
          status: 'PENDING',
          scheduledFor: {
            [Op.lte]: now
          }
        }
      });

      if (pendingMessages.length === 0) return;

      logger.info(`Processing ${pendingMessages.length} scheduled messages`);

      for (const scheduled of pendingMessages) {
        try {
          // 1. Create the actual message
          const message = await Message.create({
            chatId: scheduled.chatId,
            senderId: scheduled.senderId,
            content: scheduled.content,
            messageType: scheduled.messageType,
            fileUrl: scheduled.fileUrl,
            fileName: scheduled.fileName,
            fileSize: scheduled.fileSize,
            isForwarded: false
          });

          // 2. Update scheduled message status
          await scheduled.update({
            status: 'SENT',
            sentAt: new Date(),
            messageId: message.id
          });

          // 3. Emit via socket if io is provided
          if (io) {
            const messageWithSender = await Message.findByPk(message.id, {
              include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'avatar'] }]
            });

            io.to(`chat:${scheduled.chatId}`).emit('receive_message', messageWithSender);
            
            // Notify members
            const members = await ChatMember.findAll({ where: { chatId: scheduled.chatId } });
            members.forEach(member => {
              if (member.userId !== scheduled.senderId) {
                io.to(`user:${member.userId}`).emit('new_message_notification', {
                  chatId: scheduled.chatId,
                  message: messageWithSender,
                  sender: messageWithSender.sender
                });
              }
            });
          }

          // 4. Handle recurring messages
          if (scheduled.isRecurring && scheduled.recurringPattern) {
            await this.handleRecurringMessage(scheduled);
          }

          logger.info(`Scheduled message ${scheduled.id} sent successfully`);
        } catch (msgError) {
          logger.error(`Error sending scheduled message ${scheduled.id}:`, msgError);
          await scheduled.update({
            status: 'FAILED',
            failureReason: msgError.message,
            retryCount: scheduled.retryCount + 1
          });
        }
      }
    } catch (error) {
      logger.error('Process scheduled messages error:', error);
    }
  }

  /**
   * Create next occurrence for a recurring message
   */
  async handleRecurringMessage(scheduled) {
    try {
      let nextDate = moment(scheduled.scheduledFor);

      switch (scheduled.recurringPattern) {
        case 'DAILY':
          nextDate.add(1, 'day');
          break;
        case 'WEEKLY':
          nextDate.add(1, 'week');
          break;
        case 'MONTHLY':
          nextDate.add(1, 'month');
          break;
      }

      // Check if we reached the end date
      if (scheduled.recurringEndDate && nextDate.isAfter(scheduled.recurringEndDate)) {
        return;
      }

      await ScheduledMessage.create({
        senderId: scheduled.senderId,
        chatId: scheduled.chatId,
        content: scheduled.content,
        scheduledFor: nextDate.toDate(),
        messageType: scheduled.messageType,
        fileUrl: scheduled.fileUrl,
        fileName: scheduled.fileName,
        fileSize: scheduled.fileSize,
        isRecurring: true,
        recurringPattern: scheduled.recurringPattern,
        recurringEndDate: scheduled.recurringEndDate,
        status: 'PENDING'
      });
    } catch (error) {
      logger.error('Handle recurring message error:', error);
    }
  }
}

module.exports = new ScheduledMessageService();

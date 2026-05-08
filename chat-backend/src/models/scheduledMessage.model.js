const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ScheduledMessage = sequelize.define('ScheduledMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  messageId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Message',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  chatId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Chat',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  scheduledFor: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'SENT', 'FAILED', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  messageType: {
    type: DataTypes.ENUM('TEXT', 'IMAGE', 'FILE'),
    defaultValue: 'TEXT'
  },
  fileUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurringPattern: {
    type: DataTypes.ENUM('DAILY', 'WEEKLY', 'MONTHLY'),
    allowNull: true
  },
  recurringEndDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  retryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  indexes: [
    {
      fields: ['sender_id']
    },
    {
      fields: ['chat_id']
    },
    {
      fields: ['message_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['scheduled_for']
    },
    {
      fields: ['is_recurring']
    }
  ]
});

module.exports = ScheduledMessage;

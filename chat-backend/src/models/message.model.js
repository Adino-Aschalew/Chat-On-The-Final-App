const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
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
  replyToId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Message',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  threadId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Thread',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  messageType: {
    type: DataTypes.ENUM('TEXT', 'IMAGE', 'FILE', 'SYSTEM'),
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
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  editedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  originalContent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  scheduledFor: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isScheduled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isDelivered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isForwarded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  forwardedFromId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'User',
      key: 'id'
    }
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
      fields: ['reply_to_id']
    },
    {
      fields: ['thread_id']
    },
    {
      fields: ['message_type']
    },
    {
      fields: ['is_deleted']
    },
    {
      fields: ['is_scheduled']
    },
    {
      fields: ['scheduled_for']
    },
    {
      fields: ['created_at']
    },
    {
      type: 'FULLTEXT',
      fields: ['content']
    }
  ]
});

module.exports = Message;

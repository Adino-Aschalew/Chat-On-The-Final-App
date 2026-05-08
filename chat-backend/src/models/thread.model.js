const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Thread = sequelize.define('Thread', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  messageId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Message',
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
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  messageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  participantCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  indexes: [
    {
      fields: ['message_id']
    },
    {
      fields: ['chat_id']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['is_archived']
    },
    {
      fields: ['last_message_at']
    }
  ]
});

module.exports = Thread;

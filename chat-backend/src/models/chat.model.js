const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Chat = sequelize.define('Chat', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('PRIVATE', 'GROUP', 'CHANNEL'),
    allowNull: false,
    defaultValue: 'PRIVATE'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  memberCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  pinnedMessageId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Messages',
      key: 'id'
    }
  }
}, {
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['is_archived']
    },
    {
      fields: ['last_message_at']
    }
  ]
});

module.exports = Chat;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatMember = sequelize.define('ChatMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
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
  role: {
    type: DataTypes.ENUM('ADMIN', 'MEMBER'),
    defaultValue: 'MEMBER',
    allowNull: false
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastReadAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isMuted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'chat_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['chat_id']
    },
    {
      fields: ['role']
    }
  ]
});

module.exports = ChatMember;

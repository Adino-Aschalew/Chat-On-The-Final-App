const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MessageReaction = sequelize.define('MessageReaction', {
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
  emoji: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['message_id', 'user_id', 'emoji']
    },
    {
      fields: ['message_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['emoji']
    }
  ]
});

module.exports = MessageReaction;

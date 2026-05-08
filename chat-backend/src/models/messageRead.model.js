const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MessageRead = sequelize.define('MessageRead', {
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
  readAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['message_id', 'user_id']
    },
    {
      fields: ['message_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['read_at']
    }
  ]
});

module.exports = MessageRead;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Analytics = sequelize.define('Analytics', {
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
    allowNull: true,
    references: {
      model: 'Chat',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  metricType: {
    type: DataTypes.ENUM('MESSAGE_SENT', 'MESSAGE_RECEIVED', 'LOGIN', 'LOGOUT', 'FILE_UPLOADED', 'REACTION_ADDED', 'CHAT_CREATED', 'USER_JOINED_CHAT'),
    allowNull: false
  },
  metricValue: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['chat_id']
    },
    {
      fields: ['metric_type']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['date']
    },
    {
      fields: ['metric_type', 'date']
    }
  ]
});

module.exports = Analytics;

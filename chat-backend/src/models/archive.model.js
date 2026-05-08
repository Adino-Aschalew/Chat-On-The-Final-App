const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Archive = sequelize.define('Archive', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  archivedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  archiveType: {
    type: DataTypes.ENUM('FULL', 'PARTIAL'),
    defaultValue: 'FULL'
  },
  dateFrom: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dateTo: {
    type: DataTypes.DATE,
    allowNull: true
  },
  format: {
    type: DataTypes.ENUM('JSON', 'CSV', 'PDF'),
    defaultValue: 'JSON'
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  messageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isScheduled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  scheduledFor: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  indexes: [
    {
      fields: ['chat_id']
    },
    {
      fields: ['archived_by']
    },
    {
      fields: ['archive_type']
    },
    {
      fields: ['format']
    },
    {
      fields: ['is_scheduled']
    },
    {
      fields: ['scheduled_for']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Archive;

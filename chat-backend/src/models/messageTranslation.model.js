const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MessageTranslation = sequelize.define('MessageTranslation', {
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
  originalLanguage: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  targetLanguage: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  translatedContent: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  translationService: {
    type: DataTypes.STRING(50),
    defaultValue: 'Google'
  },
  cachedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['message_id', 'target_language']
    },
    {
      fields: ['message_id']
    },
    {
      fields: ['original_language']
    },
    {
      fields: ['target_language']
    },
    {
      fields: ['cached_at']
    }
  ]
});

module.exports = MessageTranslation;

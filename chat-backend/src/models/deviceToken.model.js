const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeviceToken = sequelize.define('DeviceToken', {
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
  token: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  deviceType: {
    type: DataTypes.ENUM('ANDROID', 'IOS', 'WEB'),
    allowNull: false
  },
  deviceId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastUsedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'token']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['token']
    },
    {
      fields: ['device_type']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = DeviceToken;

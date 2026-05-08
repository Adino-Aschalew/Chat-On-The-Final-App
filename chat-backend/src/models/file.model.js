const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const File = sequelize.define('File', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  originalName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  thumbnailPath: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  indexes: [
    {
      fields: ['uploaded_by']
    },
    {
      fields: ['mime_type']
    },
    {
      fields: ['is_public']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = File;

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SystemSetting = sequelize.define('SystemSetting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('boolean', 'number', 'string', 'json'),
      allowNull: false,
      defaultValue: 'string',
    },
    category: {
      type: DataTypes.ENUM('system', 'security', 'maintenance', 'performance'),
      allowNull: false,
      defaultValue: 'system',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  }, {
    tableName: 'system_settings',
    timestamps: true,
    indexes: [
      {
        fields: ['key'],
        unique: true,
      },
      {
        fields: ['category'],
      },
    ],
  });

  SystemSetting.associate = (models) => {
    SystemSetting.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByUser',
    });
  };

  return SystemSetting;
};

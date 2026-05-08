const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true, // Made optional for OAuth users
    validate: {
      len: [6, 255],
      notEmpty: true
    }
  },
  googleId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'USER'),
    defaultValue: 'USER',
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastSeen: {
    type: DataTypes.DATE,
    allowNull: true
  },
  presenceStatus: {
    type: DataTypes.ENUM('ONLINE', 'AWAY', 'BUSY', 'INVISIBLE', 'OFFLINE'),
    defaultValue: 'OFFLINE'
  },
  preferredLanguage: {
    type: DataTypes.STRING(10),
    defaultValue: 'en'
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  },
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: true,
      fields: ['username']
    },
    {
      unique: true,
      fields: ['googleId']
    },
    {
      fields: ['is_online']
    },
    {
      fields: ['presence_status']
    }
  ]
});

// Instance method to check password
User.prototype.validatePassword = async function(password) {
  if (!this.password) return false; // OAuth users may not have password
  return await bcrypt.compare(password, this.password);
};

// Instance method to get safe user data
User.prototype.toSafeObject = function() {
  const { password, ...safeUser } = this.toJSON();
  return safeUser;
};

module.exports = User;

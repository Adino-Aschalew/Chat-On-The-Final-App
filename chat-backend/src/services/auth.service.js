const db = require('../models');
const { User } = db;
const { generateToken } = require('../utils/generateToken');
const { logger } = require('../middleware/error.middleware');

class AuthService {
  async register(userData) {
    try {
      const { username, email, password } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [User.sequelize.Sequelize.Op.or]: [
            { email },
            { username }
          ]
        }
      });

      if (existingUser) {
        throw new Error('User with this email or username already exists');
      }

      // Check if this is the first user (make them admin)
      const userCount = await User.count();
      const isFirstUser = userCount === 0;
      const role = isFirstUser ? 'ADMIN' : 'USER';

      // Create new user
      const user = await User.create({
        username,
        email,
        password,
        role
      });

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      logger.info(`New user registered: ${user.email} with role: ${user.role}`);

      return {
        user: user.toSafeObject(),
        token
      };
    } catch (error) {
      logger.error('Register error:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const user = await User.findOne({ where: { email } });
      
      if (!user || !(await user.validatePassword(password))) {
        throw new Error('Invalid credentials');
      }

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      logger.info(`User logged in: ${user.email}`);

      return {
        user: user.toSafeObject(),
        token
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async googleLogin(profile) {
    try {
      const email = profile.emails[0].value;
      
      // Check if user already exists
      let user = await User.findOne({ where: { email } });

      if (user) {
        // User exists, update Google info if needed
        if (!user.googleId) {
          user.googleId = profile.id;
          user.avatar = user.avatar || profile.photos[0]?.value || null;
          await user.save();
        }
        
        // Generate token for existing user
        const token = generateToken({
          id: user.id,
          email: user.email,
          role: user.role
        });

        logger.info(`Existing user logged in via Google: ${user.email}`);
        return {
          user: user.toSafeObject(),
          token,
          isNewUser: false
        };
      }

      // Create new user from Google profile
      const username = profile.displayName.replace(/\s+/g, '_').toLowerCase();
      const userCount = await User.count();
      const isFirstUser = userCount === 0;
      const role = isFirstUser ? 'ADMIN' : 'USER';

      user = await User.create({
        username,
        email,
        avatar: profile.photos[0]?.value || null,
        googleId: profile.id,
        role,
        isVerified: true,
        password: Math.random().toString(36) + Math.random().toString(36) // Random password for OAuth users
      });

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      logger.info(`New user created via Google: ${user.email} with role: ${role}`);

      return {
        user: user.toSafeObject(),
        token,
        isNewUser: true
      };
    } catch (error) {
      logger.error('Google login error:', error);
      throw error;
    }
  }

  async googleLogin(profile) {
    try {
      const email = profile.emails[0].value;
      
      // Check if user already exists
      let user = await User.findOne({ where: { email } });

      if (user) {
        // User exists, update Google info if needed
        if (!user.googleId) {
          user.googleId = profile.id;
          user.avatar = user.avatar || profile.photos[0]?.value || null;
          await user.save();
        }
        
        // Generate token for existing user
        const token = generateToken({
          id: user.id,
          email: user.email,
          role: user.role
        });

        logger.info(`Existing user logged in via Google: ${user.email}`);
        return {
          user: user.toSafeObject(),
          token,
          isNewUser: false
        };
      }

      // Create new user from Google profile
      const username = profile.displayName.replace(/\s+/g, '_').toLowerCase();
      const userCount = await User.count();
      const isFirstUser = userCount === 0;
      const role = isFirstUser ? 'ADMIN' : 'USER';

      user = await User.create({
        username,
        email,
        avatar: profile.photos[0]?.value || null,
        googleId: profile.id,
        role,
        isVerified: true,
        password: Math.random().toString(36) + Math.random().toString(36) // Random password for OAuth users
      });

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      logger.info(`New user created via Google: ${user.email} with role: ${role}`);

      return {
        user: user.toSafeObject(),
        token,
        isNewUser: true
      };
    } catch (error) {
      logger.error('Google login error:', error);
      throw error;
    }
  }

  async logout(userId) {
    try {
      await User.update(
        {
          isOnline: false,
          lastSeen: new Date(),
          presenceStatus: 'OFFLINE'
        },
        {
          where: { id: userId }
        }
      );

      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  async getProfile(userId) {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      return user.toSafeObject();
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  async updateProfile(userId, updateData) {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Remove sensitive fields from update data
      const { password, role, ...safeUpdateData } = updateData;

      await user.update(safeUpdateData);

      logger.info(`Profile updated for user: ${userId}`);

      return user.toSafeObject();
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  async changePassword(userId, passwordData) {
    try {
      const { currentPassword, newPassword } = passwordData;

      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await user.validatePassword(currentPassword);

      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      await user.update({ password: newPassword });

      logger.info(`Password changed for user: ${userId}`);

      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();

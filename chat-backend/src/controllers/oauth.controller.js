const authService = require('../services/auth.service');
const passport = require('../config/passport');
const { logger } = require('../middleware/error.middleware');

class OAuthController {
  async googleCallback(req, res, next) {
    try {
      // This will be handled by passport middleware in oauth.routes.js
      next();
    } catch (error) {
      logger.error('Google OAuth callback error:', error);
      next(error);
    }
  }
}

module.exports = new OAuthController();

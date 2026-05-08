const express = require('express');
const passport = require('../config/passport');
const { generateToken } = require('../utils/generateToken');
const { authController } = require('../controllers/auth.controller');

const router = express.Router();

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 *       500:
 *         description: Server error
 */
router.get('/google', (req, res, next) => {
  try {
    // Generate state parameter for security
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store state in session or temporary storage
    req.session = req.session || {};
    req.session.oauthState = state;
    
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: state
    })(req, res, next);
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate OAuth'
    });
  }
});

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State parameter for security
 *     responses:
 *       200:
 *         description: OAuth successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       302:
 *         description: Redirect to frontend with token
 *       400:
 *         description: Invalid state or OAuth error
 *       500:
 *         description: Server error
 */
router.get('/google/callback', (req, res, next) => {
  try {
    const { code, state, error } = req.query;
    
    // Check for OAuth errors
    if (error) {
      console.error('Google OAuth error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(error)}`);
    }
    
    // Verify state parameter
    if (!state || (req.session && state !== req.session.oauthState)) {
      console.error('Invalid OAuth state:', { received: state, expected: req.session?.oauthState });
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_state`);
    }
    
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }, (err, user) => {
      if (err) {
        console.error('Google OAuth authentication error:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(err.message)}`);
      }
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }
      
      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      // Clear session state
      if (req.session) {
        req.session.oauthState = null;
      }
      
      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(user.toSafeObject()))}`;
      res.redirect(redirectUrl);
    })(req, res, next);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
});

module.exports = router;

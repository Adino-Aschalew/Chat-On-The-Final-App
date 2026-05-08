const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const { User } = require('../models');

// Only configure Google OAuth if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Configure Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({
        where: { email: profile.emails[0].value }
      });

      if (user) {
        // User exists, update Google info if needed
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        return done(null, user);
      }

      // Create new user
      user = await User.create({
        username: profile.displayName.replace(/\s+/g, '_').toLowerCase(),
        email: profile.emails[0].value,
        avatar: profile.photos[0]?.value || null,
        googleId: profile.id,
        role: 'USER', // Default to USER for OAuth registrations
        isVerified: true
      });

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  console.log('✅ Google OAuth configured successfully');
} else {
  console.log('⚠️ Google OAuth credentials not configured - OAuth login disabled');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

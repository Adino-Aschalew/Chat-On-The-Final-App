const { verifyToken } = require('../utils/generateToken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  console.log('=== AUTH MIDDLEWARE DEBUG ===');
  console.log('AUTH HEADER:', req.header('Authorization'));
  console.log('REQUEST URL:', req.originalUrl);
  console.log('REQUEST METHOD:', req.method);
  
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('EXTRACTED TOKEN:', token ? '***PRESENT***' : '***MISSING***');
    
    if (!token) {
      console.log('AUTH FAILED: No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = verifyToken(token);
    console.log('DECODED TOKEN:', decoded);
    console.log('USER ID FROM TOKEN:', decoded.id);
    console.log('USER ROLE FROM TOKEN:', decoded.role);
    
    const user = await User.findByPk(decoded.id);
    console.log('USER FOUND IN DB:', !!user);
    console.log('USER ROLE IN DB:', user?.role);
    
    if (!user) {
      console.log('AUTH FAILED: User not found in database');
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    console.log('AUTH SUCCESS: User authenticated');
    console.log('=== END AUTH DEBUG ===');
    
    req.user = user;
    next();
  } catch (error) {
    console.log('AUTH ERROR:', error.message);
    console.log('ERROR TYPE:', error.name);
    console.log('=== END AUTH DEBUG ===');
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

module.exports = authenticate;

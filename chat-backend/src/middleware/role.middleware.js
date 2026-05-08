const isAdmin = (req, res, next) => {
  console.log('=== ADMIN ROLE MIDDLEWARE DEBUG ===');
  console.log('USER ROLE:', req.user?.role);
  console.log('REQUEST URL:', req.originalUrl);
  console.log('REQUEST METHOD:', req.method);
  
  if (!req.user) {
    console.log('ADMIN CHECK FAILED: No user in request');
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  
  if (req.user.role !== 'ADMIN') {
    console.log('ADMIN CHECK FAILED: User role is not ADMIN');
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  
  console.log('ADMIN CHECK PASSED: User has ADMIN role');
  console.log('=== END ADMIN DEBUG ===');
  
  next();
};

const isMemberOrAdmin = async (req, res, next) => {
  console.log('=== CHAT MEMBERSHIP MIDDLEWARE DEBUG ===');
  console.log('USER ID:', req.user?.id);
  console.log('USER ROLE:', req.user?.role);
  console.log('CHAT ID:', req.params.chatId || req.body.chatId);
  
  try {
    const { ChatMember } = require('../models');
    const chatId = req.params.chatId || req.body.chatId;
    
    if (req.user.role === 'ADMIN') {
      console.log('CHAT ACCESS: User is ADMIN - bypassing membership check');
      return next();
    }

    const membership = await ChatMember.findOne({
      where: {
        userId: req.user.id,
        chatId: chatId
      }
    });

    console.log('CHAT MEMBERSHIP FOUND:', !!membership);

    if (!membership) {
      console.log('CHAT ACCESS DENIED: User not a member of this chat');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not a member of this chat.'
      });
    }
    
    console.log('CHAT ACCESS GRANTED: User is a member');
    console.log('=== END CHAT DEBUG ===');
    
    next();
  } catch (error) {
    console.log('CHAT MEMBERSHIP ERROR:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error checking chat membership.'
    });
  }
};

module.exports = {
  isAdmin,
  isMemberOrAdmin
};

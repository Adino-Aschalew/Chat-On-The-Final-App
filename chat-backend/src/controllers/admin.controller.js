const adminService = require('../services/admin.service');
const { body, query, validationResult } = require('express-validator');

class AdminController {
}

AdminController.prototype.getAllUsers = async function(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const result = await adminService.getAllUsers(page, limit, search);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

AdminController.prototype.getUserById = async function(req, res, next) {
  try {
    const user = await adminService.getUserById(req.params.id);
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
}

AdminController.prototype.deleteUser = async function(req, res, next) {
  try {
    const result = await adminService.deleteUser(req.params.id);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    if (error.message && error.message.includes('Cannot delete admin users')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
}

AdminController.prototype.updateUserRole = async function(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await adminService.updateUserRole(id, role);
    res.json({
      success: true,
      data: user,
      message: 'User role updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

AdminController.prototype.getAllChats = async function(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await adminService.getAllChats(page, limit);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

AdminController.prototype.getChatById = async function(req, res, next) {
  try {
    const chat = await adminService.getChatById(req.params.id);
    
    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    next(error);
  }
}

AdminController.prototype.deleteChat = async function(req, res, next) {
  try {
    await adminService.deleteChat(req.params.id);
    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

AdminController.prototype.getSystemStats = async function(req, res, next) {
  try {
    const stats = await adminService.getSystemStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
}

AdminController.prototype.getAnalytics = async function(req, res, next) {
  try {
    const period = req.query.period || '7d';
    const analytics = await adminService.getAnalytics(period);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
}

AdminController.prototype.getSettings = async function(req, res, next) {
  try {
    const settings = await adminService.getSettings();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
}

AdminController.prototype.updateSettings = async function(req, res, next) {
  try {
    const settings = await adminService.updateSettings(req.body, req.user.id);
    
    res.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

AdminController.prototype.updateSecuritySettings = async function(req, res, next) {
  try {
    const settings = await adminService.updateSecuritySettings(req.body, req.user.id);
    
    res.json({
      success: true,
      data: settings,
      message: 'Security settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

AdminController.prototype.toggleMaintenance = async function(req, res, next) {
  try {
    const { enabled } = req.body;
    const result = await adminService.toggleMaintenance(enabled, req.user.id);
    
    res.json({
      success: true,
      data: result,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

AdminController.prototype.createBackup = async function(req, res, next) {
  try {
    const backup = await adminService.createBackup();
    
    res.json({
      success: true,
      data: backup,
      message: 'System backup completed successfully'
    });
  } catch (error) {
    next(error);
  }
}

AdminController.prototype.clearCache = async function(req, res, next) {
  try {
    const result = await adminService.clearCache();
    
    res.json({
      success: true,
      data: result,
      message: 'System cache cleared successfully'
    });
  } catch (error) {
    next(error);
  }
}

AdminController.prototype.getSecuritySettings = async function(req, res, next) {
  try {
    const settings = await adminService.getSecuritySettings();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
}

AdminController.prototype.changePassword = async function(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const result = await adminService.changePassword(userId, currentPassword, newPassword);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
}

AdminController.prototype.getAdmins = async function(req, res, next) {
  try {
    const admins = await adminService.getAdmins();
    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    next(error);
  }
}

AdminController.prototype.createAdmin = async function(req, res, next) {
  try {
    const admin = await adminService.createAdmin(req.body);
    res.status(201).json({
      success: true,
      data: admin,
      message: 'Admin created successfully'
    });
  } catch (error) {
    next(error);
  }
}

AdminController.prototype.deleteAdmin = async function(req, res, next) {
  try {
    const { id } = req.params;
    await adminService.deleteAdmin(id);
    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

AdminController.prototype.toggleAdminSuspend = async function(req, res, next) {
  try {
    const { id } = req.params;
    const { suspended } = req.body;
    const admin = await adminService.toggleAdminSuspend(id, suspended);
    res.json({
      success: true,
      data: admin,
      message: `Admin ${suspended ? 'suspended' : 'unsuspended'} successfully`
    });
  } catch (error) {
    next(error);
  }
}

AdminController.prototype.getAdminLogs = async function(req, res, next) {
  try {
    const { adminId } = req.params;
    const logs = await adminService.getAdminLogs(adminId);
    res.json({
      success: true,
      data: { logs }
    });
  } catch (error) {
    next(error);
  }
};

// Validation middleware
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters')
];

const validateUpdateRole = [
  body('role')
    .isIn(['ADMIN', 'USER'])
    .withMessage('Role must be either ADMIN or USER')
];

const validateAnalytics = [
  query('period')
    .optional()
    .isIn(['1d', '7d', '30d', '90d'])
    .withMessage('Period must be 1d, 7d, 30d, or 90d')
];

// Admin management controller methods
AdminController.prototype.getAdmins = async function(req, res, next) {
  try {
    const admins = await adminService.getAdmins();
    res.json({
      success: true,
      data: { admins }
    });
  } catch (error) {
    next(error);
  }
};

AdminController.prototype.createAdmin = async function(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const admin = await adminService.createAdmin({ username, email, password });
    res.status(201).json({
      success: true,
      data: admin,
      message: 'Admin created successfully'
    });
  } catch (error) {
    next(error);
  }
};

AdminController.prototype.deleteAdmin = async function(req, res, next) {
  try {
    const { id } = req.params;
    await adminService.deleteAdmin(id);
    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

AdminController.prototype.toggleAdminSuspend = async function(req, res, next) {
  try {
    const { id } = req.params;
    const { suspended } = req.body;
    const admin = await adminService.toggleAdminSuspend(id, suspended);
    res.json({
      success: true,
      data: admin,
      message: `Admin ${suspended ? 'suspended' : 'unsuspended'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

AdminController.prototype.getAdminLogs = async function(req, res, next) {
  try {
    const { adminId } = req.params;
    const logs = await adminService.getAdminLogs(adminId);
    res.json({
      success: true,
      data: { logs }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminController: new AdminController(),
  validatePagination,
  validateUpdateRole,
  validateAnalytics
};

const { sequelize, SystemSetting } = require('../models');

const defaultSettings = [
  // System Settings
  {
    key: 'maintenanceMode',
    value: 'false',
    type: 'boolean',
    category: 'system',
    description: 'Enable/disable maintenance mode for the entire system'
  },
  {
    key: 'allowRegistrations',
    value: 'true',
    type: 'boolean',
    category: 'system',
    description: 'Allow new user registrations'
  },
  {
    key: 'maxUsers',
    value: '1000',
    type: 'number',
    category: 'system',
    description: 'Maximum number of users allowed in the system'
  },
  {
    key: 'messageRetention',
    value: '30',
    type: 'number',
    category: 'system',
    description: 'Number of days to retain messages before cleanup'
  },
  {
    key: 'autoBackup',
    value: 'true',
    type: 'boolean',
    category: 'system',
    description: 'Enable automatic system backups'
  },
  {
    key: 'debugMode',
    value: 'false',
    type: 'boolean',
    category: 'system',
    description: 'Enable debug mode for enhanced logging'
  },
  {
    key: 'systemHealth',
    value: '95',
    type: 'number',
    category: 'system',
    description: 'System health percentage'
  },

  // Security Settings
  {
    key: 'twoFactorAuth',
    value: 'false',
    type: 'boolean',
    category: 'security',
    description: 'Enable two-factor authentication'
  },
  {
    key: 'sessionTimeout',
    value: '24',
    type: 'number',
    category: 'security',
    description: 'Session timeout in hours'
  },
  {
    key: 'passwordMinLength',
    value: '8',
    type: 'number',
    category: 'security',
    description: 'Minimum password length requirement'
  },
  {
    key: 'requireEmailVerification',
    value: 'true',
    type: 'boolean',
    category: 'security',
    description: 'Require email verification for new accounts'
  },
  {
    key: 'maxLoginAttempts',
    value: '5',
    type: 'number',
    category: 'security',
    description: 'Maximum failed login attempts before account lock'
  }
];

async function seedSystemSettings() {
  try {
    console.log('Seeding system settings...');
    
    // Check if SystemSetting model exists and is properly initialized
    if (!SystemSetting || typeof SystemSetting.upsert !== 'function') {
      console.log('SystemSetting model not properly initialized, skipping seeding');
      return;
    }
    
    // Simple approach without transactions to avoid issues
    for (const setting of defaultSettings) {
      try {
        await SystemSetting.upsert({
          ...setting,
          updatedAt: new Date(),
          createdAt: new Date()
        });
        console.log(`✓ Seeded setting: ${setting.key}`);
      } catch (settingError) {
        console.error(`✗ Failed to seed setting ${setting.key}:`, settingError.message);
        // Continue with other settings even if one fails
      }
    }
    
    console.log('System settings seeding completed!');
  } catch (error) {
    console.error('Error seeding system settings:', error);
    // Don't throw error to prevent server from stopping
    console.log('Continuing server startup despite seeding error...');
  }
}

module.exports = {
  seedSystemSettings,
  defaultSettings
};

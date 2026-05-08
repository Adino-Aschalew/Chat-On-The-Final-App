const { User } = require('../models');
const { logger } = require('../middleware/error.middleware');
require('dotenv').config();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@chatapp.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

    const admin = await User.create({
      username: 'admin',
      email: adminEmail,
      password: adminPassword,
      role: 'ADMIN',
      isOnline: false,
      presenceStatus: 'OFFLINE'
    });

    console.log('Admin user created successfully:');
    console.log('Email:', admin.email);
    console.log('Username:', admin.username);
    console.log('Password:', adminPassword);
    console.log('Role:', admin.role);
    
    logger.info(`Admin user created: ${admin.email}`);

  } catch (error) {
    console.error('Error creating admin user:', error);
    logger.error('Error creating admin user:', error);
    throw error;
  }
}

module.exports = { createAdmin };

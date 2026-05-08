const { sequelize } = require('../models');
const { logger } = require('../middleware/error.middleware');
require('dotenv').config();

async function migrate() {
  try {
    console.log('Starting database migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models (force: true drops existing tables)
    const force = process.env.FORCE_SYNC !== 'false';
    await sequelize.sync({ force, alter: !force });
    console.log(`Database schema ${force ? 'recreated' : 'synchronized'} successfully.`);
    
    logger.info('Database migration completed successfully');
    console.log('\n✅ Migration completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();

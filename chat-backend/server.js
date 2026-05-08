const http = require('http');
const socketIo = require('socket.io');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('./config/passport');
const { sequelize } = require('./src/models');
const ChatSocket = require('./src/sockets/chat.socket');
const { logger } = require('./src/middleware/error.middleware');
const cron = require('node-cron');
const scheduledMessageService = require('./src/services/scheduledMessage.service');
const { seedSystemSettings } = require('./src/seeders/systemSettings.seed');
const { createAdmin } = require('./src/seeders/createAdmin');
require('dotenv').config();

const authRoutes = require('./src/routes/auth.routes');
const oauthRoutes = require('./src/routes/oauth.routes');
const userRoutes = require('./src/routes/user.routes');
const chatRoutes = require('./src/routes/chat.routes');
const adminRoutes = require('./src/routes/admin.routes');
const { errorHandler } = require('./src/middleware/error.middleware');

const app = express();

// Trust proxy for OAuth
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST"],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

// Session middleware (required for OAuth)
app.use(session({
  secret: process.env.JWT_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Initialize chat socket handlers
const chatSocket = new ChatSocket(io);

// Database connection and server start
async function startServer() {
  try {
    console.log('🚀 Starting server...');
    
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    console.log('✅ Database connected');

    // Sync database models (in development)
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log('🔄 Syncing database models...');
        // Sync only new models to prevent index errors
        await sequelize.sync({ force: false, alter: false });
        logger.info('Database models synchronized.');
        console.log('✅ Database models synchronized');
      } catch (syncError) {
        logger.error('Database sync failed:', syncError);
        logger.info('Continuing server startup despite sync error...');
        console.log('⚠️ Database sync failed, continuing...');
      }
    } else {
      console.log('ℹ️ Not in development mode, skipping database sync');
    }

    // Run seeders with enhanced error handling
    try {
      console.log('🌱 Running system settings seeder...');
      await seedSystemSettings();
      logger.info('System settings seeding completed successfully');
      console.log('✅ System settings seeding completed');
    } catch (error) {
      logger.error('System settings seeding failed:', error);
      logger.info('Continuing server startup despite seeding error...');
      console.log('⚠️ System settings seeding failed, continuing...');
    }
    
    try {
      console.log('👤 Running admin user seeder...');
      await createAdmin();
      logger.info('Admin user seeding completed successfully');
      console.log('✅ Admin user seeding completed');
    } catch (error) {
      logger.error('Admin user seeding failed:', error);
      logger.info('Continuing server startup despite admin seeding error...');
      console.log('⚠️ Admin user seeding failed, continuing...');
    }

    // Start server
    console.log('🚀 Starting HTTP server...');
    server.listen(PORT, () => {
      console.log('✅ Server is running on port', PORT);
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`Health Check: http://localhost:${PORT}/health`);

      // Start cron job for scheduled messages
      cron.schedule('* * * * *', () => {
        scheduledMessageService.processScheduledMessages(io);
      });
      logger.info('Scheduled messages cron job started');
      console.log('✅ Cron job started');
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  
  server.close(async () => {
    logger.info('HTTP server closed.');
    
    try {
      await sequelize.close();
      logger.info('Database connection closed.');
      process.exit(0);
    } catch (error) {
      logger.error('Error during database shutdown:', error);
      process.exit(1);
    }
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  
  server.close(async () => {
    logger.info('HTTP server closed.');
    
    try {
      await sequelize.close();
      logger.info('Database connection closed.');
      process.exit(0);
    } catch (error) {
      logger.error('Error during database shutdown:', error);
      process.exit(1);
    }
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
console.log('🎯 Initializing server startup...');
startServer();

module.exports = server;

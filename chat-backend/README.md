# Chat Backend

A production-ready real-time chat application backend built with Node.js, Express, MySQL, Sequelize ORM, and Socket.IO.

## Features

### Core Features
- Real-time messaging with Socket.IO
- JWT authentication with bcrypt password hashing
- Role-based access control (Admin/User)
- Private, group, and channel chats
- Message threading and replies
- File attachments with image processing
- Message reactions and emojis
- Read receipts
- Typing indicators
- Online/offline user status

### Advanced Features
- Message editing and deletion with versioning
- Chat search functionality
- User avatar management
- Chat archiving and export
- User presence status (Online, Away, Busy, Invisible)
- Message scheduling
- Push notifications (Firebase)
- Chat translation services
- Analytics and reporting

### Enterprise Features
- Database seeding with sample data
- Comprehensive API documentation (Swagger)
- Rate limiting and security
- Logging and monitoring
- Caching with Redis
- Cron job scheduling
- Multi-language support

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with Sequelize ORM
- **Real-time**: Socket.IO
- **Authentication**: JWT, bcrypt
- **File Storage**: Multer, Sharp
- **Documentation**: Swagger
- **Caching**: Redis
- **Queue**: Bull (Redis-based)
- **Logging**: Winston
- **Push Notifications**: Firebase Admin SDK
- **Translation**: Google Translate API

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Set up MySQL database and update credentials in .env

5. Run database migrations and seeders:
   ```bash
   npm run seed
   npm run seed:sample
   ```

6. Start the server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Documentation

Once the server is running, visit `http://localhost:3000/api-docs` to view the interactive API documentation.

## Project Structure

```
src/
├── config/          # Database and app configuration
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Sequelize models
├── routes/          # API routes
├── services/        # Business logic services
├── sockets/         # Socket.IO handlers
├── utils/           # Utility functions
└── seeders/         # Database seeders
```

## Environment Variables

See `.env.example` for all available configuration options.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Chats
- `POST /api/chats` - Create chat
- `GET /api/chats` - Get user chats
- `GET /api/chats/:id` - Get chat details
- `PUT /api/chats/:id` - Update chat
- `DELETE /api/chats/:id` - Delete chat

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:chatId` - Get chat messages
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files/:id` - Download file
- `DELETE /api/files/:id` - Delete file

### Search
- `GET /api/search/messages` - Search messages
- `GET /api/search/users` - Search users

### Admin
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - Get analytics

## Socket.IO Events

### Client to Server
- `join_chat` - Join a chat room
- `leave_chat` - Leave a chat room
- `send_message` - Send a message
- `typing_start` - Start typing
- `typing_stop` - Stop typing
- `message_read` - Mark message as read

### Server to Client
- `receive_message` - New message received
- `user_joined` - User joined chat
- `user_left` - User left chat
- `typing` - User is typing
- `message_updated` - Message updated
- `user_status_changed` - User status changed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

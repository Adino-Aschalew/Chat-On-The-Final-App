# Chat Frontend

A modern, real-time chat application frontend built with React, Vite, and TailwindCSS.

## Features

- Real-time messaging with Socket.IO
- Private, group, and channel chats
- Message threading and replies
- File attachments with image preview
- Message reactions with emoji picker
- Read receipts and typing indicators
- Online/offline/presence status
- Message editing and deletion
- User avatars and profiles
- Chat search (messages and users)
- Chat archiving and export
- Message scheduling
- Chat translation
- Admin analytics dashboard
- User management (admin)
- Light/dark theme toggle
- PDF and document file previews
- Firebase push notifications

## Tech Stack

- React + Vite
- TailwindCSS with custom theme
- Socket.io-client
- React Router DOM
- React Context API
- Axios for API calls
- Framer Motion for animations
- Phosphor Icons
- Emoji-picker-react
- React-hot-toast for notifications
- React-pdf for PDF viewing
- Firebase (push notifications)
- next-themes for theme management

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Environment Variables

See `.env.example` for all available configuration options.

## API Integration

The frontend connects to the backend API at `http://localhost:3000/api` by default. Ensure the backend server is running before starting the frontend.

## Socket.IO

The frontend connects to the Socket.IO server at `http://localhost:3000` for real-time messaging.

## Firebase (Optional)

For push notifications, configure Firebase credentials in the `.env` file. Without these, the app will still work but push notifications will be disabled.

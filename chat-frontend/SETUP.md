# Chat Frontend - Setup Instructions

## Installation

1. Navigate to the chat-frontend directory:
```bash
cd chat-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# The .env file is already created with default values
# Edit .env if you need to change the API URL or add Firebase credentials
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Backend Setup

Ensure the chat-backend is running on `http://localhost:3000` before starting the frontend.

1. Navigate to chat-backend:
```bash
cd chat-backend
```

2. Run database migration:
```bash
npm run migrate
```

3. Seed the database:
```bash
npm run seed
```

4. Start the backend server:
```bash
npm run dev
```

## Features Implemented

### Core Features
- ✅ Real-time messaging with Socket.IO
- ✅ Private, group, and channel chats
- ✅ Message threading and replies
- ✅ File attachments with image preview
- ✅ Message reactions with emoji picker
- ✅ Read receipts and typing indicators
- ✅ Online/offline/presence status
- ✅ Message editing and deletion
- ✅ User avatars and profiles

### Advanced Features
- ✅ Chat search (messages and users)
- ✅ Chat archiving and export (backend ready)
- ✅ Message scheduling (backend ready)
- ✅ Chat translation (backend ready)
- ✅ Admin analytics dashboard with real API data
- ✅ User management (admin)

### UI/UX Features
- ✅ Animated landing page with hero section
- ✅ Light/dark theme toggle
- ✅ PDF viewer component
- ✅ Document preview component
- ✅ File preview modal
- ✅ Emoji picker integration
- ✅ Create chat modal (private/group/channel)
- ✅ Settings page
- ✅ Profile page
- ✅ Notification badge on sidebar
- ✅ OAuth buttons (placeholder - requires backend OAuth setup)
- ✅ Auto-scroll to new messages
- ✅ Protected routes with role-based access (admin)
- ✅ Responsive design with mobile menu

### Fixed Issues from Requirements
- ✅ User Search API fixed to use `/users/search`
- ✅ Admin dashboard uses real API data
- ✅ Admin role guard implemented with ProtectedRoute
- ✅ Message auto-scroll implemented
- ✅ File attachment functionality implemented
- ✅ Emoji picker implemented
- ✅ Settings page created
- ✅ Profile page created
- ✅ Group chat creation modal implemented
- ✅ OAuth buttons added (placeholder)
- ✅ Message read receipts in MessageBubble
- ✅ Notification badge on sidebar
- ✅ Contact "Message" button in Profile page

## Configuration

### Environment Variables

Edit `.env` file to configure:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# Firebase (optional - for push notifications)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Firebase Setup (Optional)

To enable push notifications:

1. Create a Firebase project at https://console.firebase.google.com/
2. Add a web app to your project
3. Copy the Firebase config values to your `.env` file
4. Push notifications will work automatically

## Project Structure

```
chat-frontend/
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── globals.css
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── chat/
│   │   │   ├── ChatLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── FileUpload.jsx (via MessageInput)
│   │   │   ├── MessageReactions.jsx
│   │   │   ├── ThreadView.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   ├── PDFViewer.jsx
│   │   │   ├── DocumentPreview.jsx
│   │   │   └── CreateChatModal.jsx
│   │   ├── landing/
│   │   │   ├── HeroSection.jsx
│   │   │   ├── FeaturesSection.jsx
│   │   │   └── AnimatedBackground.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   ├── FilePreview.jsx
│   │   │   ├── EmojiPicker.jsx
│   │   │   └── SearchBar.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── UserManagement.jsx
│   │       └── AnalyticsChart.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   ├── SocketContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── NotificationContext.jsx
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ChatRoom.jsx
│   │   ├── Admin.jsx
│   │   ├── Settings.jsx
│   │   └── Profile.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── chatService.js
│   │   └── fileService.js
│   ├── utils/
│   │   ├── animations.js
│   │   └── formatters.js
│   ├── App.jsx
│   └── main.jsx
├── public/
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
├── .env
└── .env.example
```

## API Integration

The frontend connects to the backend at:
- API: `http://localhost:3000/api`
- Socket.IO: `http://localhost:3000`

## Default Admin User

After running the seed script in the backend, you can login with:
- Email: `admin@example.com`
- Password: `admin123`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Tech Stack

- React 18
- Vite
- TailwindCSS
- Socket.io-client
- React Router DOM
- Framer Motion
- Phosphor Icons
- React Hot Toast
- emoji-picker-react
- date-fns
- Firebase (optional)

## Notes

- The landing page is public and redirects to login/register
- Theme toggle is in the sidebar header
- Settings page includes profile editing, theme toggle, and notification settings
- Admin dashboard is protected and requires ADMIN role
- File uploads are handled via the backend `/api/files/upload` endpoint
- PDF viewer uses react-pdf CDN worker
- Charts are placeholders - integrate recharts or chart.js for data visualization

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        setConnected(true);
        console.log('Socket connected');
      });

      newSocket.on('disconnect', () => {
        setConnected(false);
        console.log('Socket disconnected');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      newSocket.on('user_profile_updated', (data) => {
        console.log('User profile updated:', data);
        // This event is emitted when a user updates their profile
        // Components can listen to this to update cached user data
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  const joinChat = (chatId) => {
    if (socket) {
      socket.emit('join_chat', { chatId });
    }
  };

  const leaveChat = (chatId) => {
    if (socket) {
      socket.emit('leave_chat', { chatId });
    }
  };

  const sendMessage = (messageData) => {
    if (socket) {
      socket.emit('send_message', messageData);
    }
  };

  const sendTypingStart = (chatId) => {
    if (socket) {
      socket.emit('typing_start', { chatId });
    }
  };

  const sendTypingStop = (chatId) => {
    if (socket) {
      socket.emit('typing_stop', { chatId });
    }
  };

  const markMessageRead = (messageId) => {
    if (socket) {
      socket.emit('message_read', { messageId });
    }
  };

  const emitProfileUpdate = () => {
    if (socket) {
      socket.emit('profile_updated');
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        joinChat,
        leaveChat,
        sendMessage,
        sendTypingStart,
        sendTypingStop,
        markMessageRead,
        emitProfileUpdate,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

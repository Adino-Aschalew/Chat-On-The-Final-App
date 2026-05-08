import { createContext, useContext, useState, useRef } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';

const NotificationContext = createContext(null);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
};

export const NotificationProvider = ({ children }) => {
  const [permission, setPermission] = useState('default');
  const [token, setToken] = useState(null);
  const messagingRef = useRef(null);
  const appRef = useRef(null);

  const initializeFirebase = () => {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase is not configured. Please set the required environment variables.');
      return null;
    }

    if (!appRef.current) {
      try {
        appRef.current = initializeApp(firebaseConfig);
        messagingRef.current = getMessaging(appRef.current);
      } catch (error) {
        console.error('Firebase initialization error:', error);
        return null;
      }
    }

    return messagingRef.current;
  };

  const requestPermission = async () => {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase is not configured. Cannot request notification permission.');
      return null;
    }

    const messaging = initializeFirebase();
    if (!messaging) return null;

    try {
      const currentPermission = await Notification.requestPermission();
      setPermission(currentPermission);

      if (currentPermission === 'granted') {
        const currentToken = await getToken(messaging);
        setToken(currentToken);
        return currentToken;
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
  };

  const listenForMessages = () => {
    const messaging = initializeFirebase();
    if (!messaging) return;

    try {
      onMessage(messaging, (payload) => {
        console.log('Message received:', payload);
        // Handle incoming message
      });
    } catch (error) {
      console.error('Message listener error:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        permission,
        token,
        requestPermission,
        listenForMessages,
        isConfigured: isFirebaseConfigured(),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

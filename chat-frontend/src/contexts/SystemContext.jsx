import { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { toast } from 'sonner';
import api from '../services/api';

const SystemContext = createContext();

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};

export const SystemProvider = ({ children }) => {
  const { socket } = useSocket();
  const [systemStatus, setSystemStatus] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    maxUsers: 1000,
    debugMode: false,
  });
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 24,
    passwordMinLength: 8,
    maxLoginAttempts: 5,
  });

  // Load system settings from backend
  useEffect(() => {
    const loadSystemSettings = async () => {
      try {
        const response = await api.get('/admin/settings');
        const data = response.data?.data || response.data;
        if (data) {
          setSystemStatus(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Failed to load system settings:', error);
        // Keep default values if backend fails
      }
    };
    loadSystemSettings();
  }, []);

  // Load security settings from backend
  useEffect(() => {
    const loadSecuritySettings = async () => {
      try {
        const response = await api.get('/admin/security-settings');
        const data = response.data?.data || response.data;
        if (data) {
          setSecuritySettings(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Failed to load security settings:', error);
        // Keep default values if backend fails
      }
    };
    loadSecuritySettings();
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Handle maintenance mode changes
    socket.on('system:maintenance', (data) => {
      setSystemStatus(prev => ({ ...prev, maintenanceMode: data.enabled }));
      
      if (data.enabled) {
        toast.warning(data.message, {
          duration: 10000,
          description: data.details?.affectedFeatures?.join(', ') ? 'Affected: ' + data.details.affectedFeatures.join(', ') : '',
          action: {
            label: 'Understood',
            onClick: () => {},
          },
        });
      } else {
        toast.success(data.message);
      }
    });

    // Handle maintenance warning
    socket.on('system:maintenance-warning', (data) => {
      toast.warning(data.message, {
        duration: 30000,
        description: `${data.countdown} seconds remaining`,
        action: {
          label: 'Save Work',
          onClick: () => {
            // Trigger save functionality if available
            window.dispatchEvent(new CustomEvent('save-work'));
          },
        },
      });
    });

    // Handle maintenance ended
    socket.on('system:maintenance-ended', (data) => {
      setSystemStatus(prev => ({ ...prev, maintenanceMode: false }));
      
      toast.success(data.message, {
        duration: 8000,
        description: data.featuresRestored?.join(', ') ? 'Restored: ' + data.featuresRestored.join(', ') : '',
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload(),
        },
      });
    });

    // Handle admin maintenance notices
    socket.on('system:maintenance-admin-notice', (data) => {
      toast.info(data.message, {
        duration: 10000,
        description: `Connected users: ${data.connectedUsers}`,
      });
    });

    // Handle registration changes
    socket.on('system:registrations', (data) => {
      setSystemStatus(prev => ({ ...prev, allowRegistrations: data.enabled }));
      
      if (data.enabled) {
        toast.success(data.message);
      } else {
        toast.warning(data.message, {
          duration: 8000,
        });
      }
    });

    // Handle user limit changes
    socket.on('system:user-limit', (data) => {
      setSystemStatus(prev => ({ ...prev, maxUsers: data.limit }));
      toast.info(data.message);
    });

    // Handle debug mode changes
    socket.on('system:debug', (data) => {
      setSystemStatus(prev => ({ ...prev, debugMode: data.enabled }));
      
      if (data.enabled) {
        toast.warning(data.message, {
          duration: 5000,
        });
      } else {
        toast.success(data.message);
      }
    });

    // Handle security changes
    socket.on('system:security', (data) => {
      if (data.type === 'password-policy') {
        setSecuritySettings(prev => ({
          ...prev,
          passwordMinLength: data.passwordMinLength,
          maxLoginAttempts: data.maxLoginAttempts,
        }));
        toast.info(data.message);
      } else if (data.type === 'session-timeout') {
        setSecuritySettings(prev => ({
          ...prev,
          sessionTimeout: data.sessionTimeout,
        }));
        toast.info(data.message);
      }
    });

    // Handle backup notifications
    socket.on('system:backup', (data) => {
      toast.success(data.message, {
        duration: 5000,
        description: data.size ? `Size: ${data.size}` : 'Backup completed',
        action: {
          label: 'Details',
          onClick: () => {
            // Show backup details modal or navigate to backup management
            console.log('Backup details:', data);
          },
        },
      });
    });

    // Handle cache clearing
    socket.on('system:cache-cleared', (data) => {
      toast.success(data.message, {
        duration: 5000,
        description: data.itemsCleared ? `${data.itemsCleared} items cleared` : 'Cache cleared successfully',
        details: data.details ? {
          'App Cache': data.details.applicationCache ? '✓' : '✗',
          'Redis Cache': data.details.redisCache ? '✓' : '✗',
          'Sessions': data.details.sessions ? '✓' : '✗',
        } : undefined,
      });
    });

    // Handle forced logout
    socket.on('force:logout', (data) => {
      toast.error(data.message, {
        duration: 10000,
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    });

    // Handle forced refresh
    socket.on('force:refresh', (data) => {
      toast.info(data.message, {
        duration: 3000,
        action: {
          label: 'Refresh Now',
          onClick: () => window.location.reload(),
        },
      });
    });

    return () => {
      socket.off('system:maintenance');
      socket.off('system:maintenance-warning');
      socket.off('system:maintenance-ended');
      socket.off('system:maintenance-admin-notice');
      socket.off('system:registrations');
      socket.off('system:user-limit');
      socket.off('system:debug');
      socket.off('system:security');
      socket.off('system:backup');
      socket.off('system:cache-cleared');
      socket.off('force:logout');
      socket.off('force:refresh');
    };
  }, [socket]);

  const value = {
    systemStatus,
    securitySettings,
  };

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
};

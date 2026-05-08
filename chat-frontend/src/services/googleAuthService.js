import api from './api';

export const googleAuthService = {
  // Initiate Google OAuth
  initiateGoogleAuth: async () => {
    try {
      // Check if OAuth endpoint is available
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000'}/api/oauth/google`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 501) {
          throw new Error('Google OAuth is not configured on the server');
        }
        throw new Error(errorData.message || 'Failed to initiate OAuth');
      }
      
      // Open Google OAuth in popup window
      const width = 500;
      const height = 600;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const popup = window.open(
        `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000'}/api/oauth/google`,
        'google-auth',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );
      
      // Listen for messages from popup
      return new Promise((resolve, reject) => {
        const messageHandler = (event) => {
          if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
            window.removeEventListener('message', messageHandler);
            popup.close();
            resolve(event.data);
          } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
            window.removeEventListener('message', messageHandler);
            popup.close();
            reject(new Error(event.data.error));
          }
        };
        
        window.addEventListener('message', messageHandler);
        
        // Handle popup closed manually
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            reject(new Error('Authentication cancelled'));
          }
        }, 1000);
      });
    } catch (error) {
      throw error;
    }
  },

  // Handle OAuth callback
  handleOAuthCallback: (token, user) => {
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect based on user role
      if (user.role === 'ADMIN' || user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } else {
      window.location.href = '/login?error=oauth_failed';
    }
  },

  // Check for OAuth callback in URL
  checkOAuthCallback: () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        googleAuthService.handleOAuthCallback(token, user);
        return true;
      } catch (error) {
        console.error('Failed to parse user data:', error);
        return false;
      }
    }
    return false;
  }
};

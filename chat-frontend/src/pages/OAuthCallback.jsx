import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { googleAuthService } from '../services/googleAuthService';

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isOAuthCallback = googleAuthService.checkOAuthCallback();
    
    if (!isOAuthCallback) {
      navigate('/login?error=invalid_callback');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-tg-bg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tg-primary border-t-transparent"></div>
        <p className="mt-4 text-tg-text">Processing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;

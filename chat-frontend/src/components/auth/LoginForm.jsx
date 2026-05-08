import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { toast } from 'sonner';
import { GoogleLogo, GithubLogo, ArrowLeft } from '@phosphor-icons/react';
import { googleAuthService } from '../../services/googleAuthService';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Check for OAuth callback on component mount
  useEffect(() => {
    const isOAuthCallback = googleAuthService.checkOAuthCallback();
    if (isOAuthCallback) {
      // OAuth callback will be handled automatically
      navigate('/dashboard'); // Fallback, will be redirected by callback handler
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    setLoading(true);

    try {
      const data = await login(formData.email, formData.password);
      toast.success('Login successful!');
      
      // Redirect based on user role
      if (data.data.user.role === 'ADMIN' || data.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await googleAuthService.initiateGoogleAuth();
    } catch (error) {
      if (error.message.includes('not configured')) {
        toast.error('Google OAuth is not configured. Please use email/password login.');
      } else {
        toast.error(error.message || 'Google authentication failed');
      }
      setGoogleLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <>
      {/* Back Button */}
      <Link to="/" className="absolute top-8 left-8 z-20 group">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-full bg-tg-bg/50 backdrop-blur-xl border border-tg-border flex items-center justify-center hover:bg-tg-chat transition-all"
        >
          <ArrowLeft size={24} className="text-tg-text" />
        </motion.div>
      </Link>

      <motion.form
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
      <motion.div variants={itemVariants}>
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="name@example.com"
          required
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <button 
          type="submit" 
          className="btn-tg w-full h-12 text-lg" 
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </div>
          ) : 'Sign In'}
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-tg-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest">
          <span className="px-4 bg-tg-bg text-tg-secondary font-bold rounded-full py-1">Or continue with</span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-4">
        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="flex-1 flex items-center justify-center gap-3 px-3 sm:px-4 py-3 bg-tg-chat/50 hover:bg-tg-chat border border-tg-border text-tg-text rounded-xl transition-all shadow-md"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-tg-text/30 border-t-tg-text rounded-full animate-spin"></div>
          ) : (
            <GoogleLogo size={20} className="sm:size-20 text-red-400" weight="bold" />
          )}
          <span className="font-medium">{googleLoading ? 'Connecting...' : 'Google'}</span>
        </motion.button>
        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => toast.info('GitHub OAuth not configured')}
          className="flex-1 flex items-center justify-center gap-3 px-3 sm:px-4 py-3 bg-tg-chat/50 hover:bg-tg-chat border border-tg-border text-tg-text rounded-xl transition-all shadow-md"
        >
          <GithubLogo size={16} className="sm:size-20" weight="bold" />
          <span className="font-medium">GitHub</span>
        </motion.button>
      </motion.div>
    </motion.form>
    </>
  );
};

export default LoginForm;

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import RegisterForm from '../components/auth/RegisterForm';
import { useSystem } from '../contexts/SystemContext';
import { motion } from 'framer-motion';
import { WarningCircle } from '@phosphor-icons/react';

const Register = () => {
  const { systemStatus } = useSystem();
  const navigate = useNavigate();

  useEffect(() => {
    if (!systemStatus.allowRegistrations) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [systemStatus.allowRegistrations, navigate]);

  if (!systemStatus.allowRegistrations) {
    return (
      <AuthLayout
        title="Registration Disabled"
        subtitle="User registration is currently unavailable"
        linkText="Back to Sign In"
        linkTo="/login"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <WarningCircle size={32} className="text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Registration Temporarily Disabled
          </h3>
          <p className="text-gray-600 text-center mb-4">
            The administrator has disabled new user registrations. Please try again later or contact support.
          </p>
          <p className="text-sm text-gray-500 text-center">
            You will be redirected to the login page in a few seconds...
          </p>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join thousands of users chatting today"
      linkText="Already have an account? Sign in"
      linkTo="/login"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;

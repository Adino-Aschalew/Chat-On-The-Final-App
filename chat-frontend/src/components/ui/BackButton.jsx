import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from '@phosphor-icons/react';
import { useTheme } from '../../contexts/ThemeContext';

const BackButton = ({ to = '/', className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <Link to={to} className={`absolute top-6 left-6 z-20 group ${className}`}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`w-12 h-12 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all group-hover:shadow-lg ${
          theme === 'dark' 
            ? 'bg-white/10 border-white/20 hover:bg-white/20 group-hover:shadow-white/10' 
            : 'bg-gray-200/50 border-gray-300 hover:bg-gray-300/50 group-hover:shadow-gray-500/10'
        }`}
      >
        <ArrowLeft size={24} className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
      </motion.div>
    </Link>
  );
};

export default BackButton;

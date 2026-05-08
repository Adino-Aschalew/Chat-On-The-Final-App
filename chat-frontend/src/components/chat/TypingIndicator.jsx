import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const TypingIndicator = ({ users = [] }) => {
  const { theme } = useTheme();
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="w-2 h-2 bg-amber-400 rounded-full"
          />
        ))}
      </div>
      <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
        {users.length === 1 ? `${users[0]} is typing...` : `${users.length} people are typing...`}
      </span>
    </div>
  );
};

export default TypingIndicator;

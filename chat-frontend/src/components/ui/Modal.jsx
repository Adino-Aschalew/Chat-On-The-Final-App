import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { useTheme } from '../../contexts/ThemeContext';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { theme } = useTheme();
  const sizes = {
    sm: 'max-w-md sm:max-w-md',
    md: 'max-w-lg sm:max-w-lg',
    lg: 'max-w-2xl sm:max-w-2xl',
    xl: 'max-w-4xl sm:max-w-4xl',
  };

    useEffect(() => {
    if (isOpen) {
      console.log(`Modal opened: ${title}`);
    }
    return () => {
      if (isOpen) console.log(`Modal closed: ${title}`);
    };
  }, [isOpen, title]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0"
          onClick={() => {
            console.log(`Backdrop clicked for: ${title}`);
            onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`${sizes[size]} w-full ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between p-3 sm:p-4 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
              <h2 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
              <button
                onClick={onClose}
                className={`p-1 sm:p-1 ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              >
                <X size={16} className="sm:size-5 text-gray-500" />
              </button>
            </div>
            <div className="p-3 sm:p-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

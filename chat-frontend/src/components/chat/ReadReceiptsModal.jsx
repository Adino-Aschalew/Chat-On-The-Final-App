import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../ui/Modal';
import { chatService } from '../../services/chatService';
import { useTheme } from '../../contexts/ThemeContext';
import Avatar from '../ui/Avatar';
import { Checks, Clock, Eye } from '@phosphor-icons/react';
import { format } from 'date-fns';

const ReadReceiptsModal = ({ isOpen, onClose, messageId }) => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen && messageId) {
      loadReceipts();
    }
  }, [isOpen, messageId]);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const data = await chatService.getReadReceipts(messageId);
      setReceipts(data || []);
    } catch (error) {
      console.error('Failed to load read receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center ${theme === 'dark' ? 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20' : 'bg-gradient-to-br from-blue-100 to-indigo-100'}`}>
            <Eye size={32} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
          </div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Read Receipts</h2>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} mt-1`}>See who has read this message</p>
        </div>

        {/* Receipts List */}
        <div className="max-h-96 overflow-y-auto space-y-3 custom-scrollbar">
          {loading ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className={`w-8 h-8 border-2 ${theme === 'dark' ? 'border-blue-500 border-t-transparent' : 'border-blue-500 border-t-transparent'} rounded-full animate-spin`} />
              <p className={`mt-3 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Loading receipts...</p>
            </motion.div>
          ) : receipts.length > 0 ? (
            <AnimatePresence>
              {receipts.map((receipt, index) => (
                <motion.div
                  key={receipt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700/50' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar user={receipt.user} size="md" />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${theme === 'dark' ? 'border-slate-900 bg-green-500' : 'border-white bg-green-500'}`}>
                        <Checks size={12} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {receipt.user?.username}
                      </p>
                      <div className={`flex items-center gap-2 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        <Clock size={14} />
                        <span>{format(new Date(receipt.readAt), 'MMM d, h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-100'}`}>
                <Eye size={32} className={theme === 'dark' ? 'text-slate-600' : 'text-gray-400'} />
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>No one has read this message yet</p>
            </motion.div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReadReceiptsModal;

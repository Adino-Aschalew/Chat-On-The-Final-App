import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowBendUpRight } from '@phosphor-icons/react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { chatService } from '../../services/chatService';
import { toast } from 'sonner';

const ThreadView = ({ isOpen, onClose, threadId, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && threadId) {
      loadThreadMessages();
    }
  }, [isOpen, threadId]);

  const loadThreadMessages = async () => {
    setLoading(true);
    try {
      const data = await chatService.getMessages(threadId);
      setMessages(data.messages || []);
    } catch (error) {
      toast.error('Failed to load thread messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (messageData) => {
    try {
      const message = await chatService.sendMessage({
        ...messageData,
        chatId: threadId,
        threadId: threadId,
      });
      setMessages((prev) => [...prev, message]);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-1/3 bg-slate-800 border-l border-slate-700 z-50 flex flex-col"
        >
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowBendUpRight size={20} className="text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Thread</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                Loading thread...
              </div>
            ) : (
              <MessageList
                messages={messages}
                currentUserId={currentUserId}
                typingUsers={[]}
              />
            )}
          </div>

          <MessageInput
            onSendMessage={handleSendMessage}
            onTypingStart={() => {}}
            onTypingStop={() => {}}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThreadView;

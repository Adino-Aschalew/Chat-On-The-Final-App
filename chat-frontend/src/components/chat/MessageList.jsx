import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const MessageList = ({ messages, currentUserId, typingUsers, onOpenThread, onEdit, onDelete, searchQuery, searchIndex, searchMatches, onPin, onReply, onForward, onShowReadReceipts }) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messageRefs = useRef({});

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (searchQuery && searchMatches.length > 0) {
      if (searchIndex >= 0 && searchIndex < searchMatches.length) {
        const activeMatch = searchMatches[searchIndex];
        // Use a small timeout to ensure DOM is updated and avoid conflict with other scrolls
        setTimeout(() => {
          const element = messageRefs.current[activeMatch.id];
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 50);
      }
    }
  }, [searchQuery, searchIndex, searchMatches]);

  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => (
          <motion.div
            key={message.id || `message-${index}`}
            ref={(el) => (messageRefs.current[message.id] = el)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            layout
          >
            <MessageBubble
              message={message}
              isOwn={[message.senderId, message.sender_id, message.sender?.id, message.userId, message.user_id].some(
                (id) => id !== undefined && id !== null && String(id) === String(currentUserId)
              )}
              onOpenThread={onOpenThread}
              onEdit={onEdit}
              onDelete={onDelete}
              searchQuery={searchQuery}
              isActiveSearch={
                searchQuery && 
                message.content?.toLowerCase().includes(searchQuery.toLowerCase()) &&
                searchMatches[searchIndex]?.id === message.id
              }
              onPin={onPin}
              onReply={onReply}
              onForward={onForward}
              onShowReadReceipts={onShowReadReceipts}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      <TypingIndicator users={typingUsers} />
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

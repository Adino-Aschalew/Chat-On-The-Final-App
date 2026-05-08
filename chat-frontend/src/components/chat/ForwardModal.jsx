import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../ui/Modal';
import { chatService } from '../../services/chatService';
import { usersService } from '../../services/usersService';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { MagnifyingGlass, PaperPlaneRight, Users, Hash, User, ArrowRight, Sparkle } from '@phosphor-icons/react';
import Avatar from '../ui/Avatar';
import { toast } from 'sonner';

const ForwardModal = ({ isOpen, onClose, message, onForwarded }) => {
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [chatsData, usersData] = await Promise.all([
        chatService.getChats(),
        usersService.getAllUsers()
      ]);
      console.log('ForwardModal loaded chats:', chatsData);
      console.log('ForwardModal loaded users:', usersData);
      setChats(chatsData.chats || []);
      // Filter out current user and users who already have a private chat
      const chatUserIds = (chatsData.chats || [])
        .filter(c => c.type === 'PRIVATE')
        .map(c => c.otherMember?.id || c.other_member?.id);
      
      const filteredUsers = (usersData.users || usersData || [])
        .filter(u => u.id !== currentUser?.id && !chatUserIds.includes(u.id));
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to load data in ForwardModal:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter(chat => {
    const name = chat.type === 'PRIVATE' 
      ? (chat.otherMember?.username || chat.name)
      : chat.name;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleForward = async (targetId, isChatId = true) => {
    try {
      let finalChatId = targetId;
      
      if (!isChatId) {
        // Create new private chat first
        const newChat = await chatService.createChat({
          type: 'PRIVATE',
          memberIds: [targetId]
        });
        finalChatId = newChat.id;
      }

      await chatService.sendMessage({
        chatId: finalChatId,
        content: message.content || '',
        messageType: message.messageType || message.message_type || 'TEXT',
        fileUrl: message.fileUrl || message.file_url || null,
        fileName: message.fileName || message.file_name || null,
        fileSize: message.fileSize || message.file_size || 0,
        isForwarded: true,
        forwardedFromId: message.senderId || message.sender_id || message.sender?.id
      });
      
      toast.success('Message forwarded');
      onClose();
      onForwarded?.();
    } catch (error) {
      console.error('Forward error:', error);
      toast.error('Failed to forward message');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Forward Message" size="md">
      <div className="space-y-6">
        {/* Message Preview */}
        <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkle size={16} className={theme === 'dark' ? 'text-amber-400' : 'text-blue-600'} />
            <p className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-amber-400' : 'text-blue-600'}`}>Message to Forward</p>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'} line-clamp-3`}>
            {message?.content || 'No content'}
          </p>
          {message?.fileUrl && (
            <div className={`mt-2 text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-600'}`}>
              {message.fileName || 'File attached'}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 focus-within:border-amber-500/50' : 'bg-white border-gray-200 focus-within:border-blue-500/50'}`}>
            <MagnifyingGlass size={20} className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'} />
            <input
              type="text"
              placeholder="Search chats or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 bg-transparent outline-none text-sm placeholder:${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto space-y-4 custom-scrollbar px-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className={`mt-3 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Loading...</p>
            </div>
          ) : (filteredChats.length > 0 || filteredUsers.length > 0) ? (
            <AnimatePresence>
              {filteredChats.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <p className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'} px-2`}>
                    Recent Chats
                  </p>
                  {filteredChats.map((chat, index) => {
                    const displayName = chat.type === 'PRIVATE' 
                      ? (chat.otherMember?.username || chat.name)
                      : chat.name;
                    
                    return (
                      <motion.button
                        key={chat.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleForward(chat.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${theme === 'dark' ? 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-amber-500/30' : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-500/30'}`}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                            {chat.type === 'GROUP' ? <Users size={24} className="text-white" /> : 
                             chat.type === 'CHANNEL' ? <Hash size={24} className="text-white" /> :
                             <span className="text-white font-bold text-lg">{displayName?.[0]?.toUpperCase()}</span>}
                          </div>
                          {chat.type === 'PRIVATE' && chat.otherMember?.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 ${theme === 'dark' ? 'border-slate-800' : 'border-white'}"></div>
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className={`font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {displayName}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'} uppercase tracking-wider`}>
                            {chat.type}
                          </p>
                        </div>
                        <div className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-amber-500/20 group-hover:bg-amber-500/30' : 'bg-blue-100 group-hover:bg-blue-200'}`}>
                          <ArrowRight size={20} className={theme === 'dark' ? 'text-amber-400' : 'text-blue-600'} />
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {filteredUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2 mt-6"
                >
                  <p className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'} px-2`}>
                    Other Users
                  </p>
                  {filteredUsers.map((u, index) => (
                    <motion.button
                      key={u.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      onClick={() => handleForward(u.id, false)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${theme === 'dark' ? 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-amber-500/30' : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-500/30'}`}
                    >
                      <div className="relative">
                        <Avatar src={u.avatar} alt={u.username} size="md" />
                        {u.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 ${theme === 'dark' ? 'border-slate-800' : 'border-white'}"></div>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className={`font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {u.username}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'} truncate`}>
                          {u.email}
                        </p>
                      </div>
                      <div className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-amber-500/20 group-hover:bg-amber-500/30' : 'bg-blue-100 group-hover:bg-blue-200'}`}>
                        <ArrowRight size={20} className={theme === 'dark' ? 'text-amber-400' : 'text-blue-600'} />
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-100'}`}>
                <MagnifyingGlass size={32} className={theme === 'dark' ? 'text-slate-600' : 'text-gray-400'} />
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>No chats or users found</p>
            </motion.div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ForwardModal;

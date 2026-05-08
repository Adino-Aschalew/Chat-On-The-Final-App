import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, DotsThreeVertical, UserPlus, Info, Bell, BellSlash, SignOut, Trash, MagnifyingGlass, X, CaretUp, CaretDown, PushPin, PushPinSlash } from '@phosphor-icons/react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ThreadView from './ThreadView';
import AddMembersModal from './AddMembersModal';
import ChatInfoModal from './ChatInfoModal';
import ForwardModal from './ForwardModal';
import ReadReceiptsModal from './ReadReceiptsModal';
import Modal from '../ui/Modal';
import { chatService } from '../../services/chatService';
import { toast } from 'sonner';

const ChatWindow = ({ chat, onBack, onChatDeleted, onChatUpdated }) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [threadOpen, setThreadOpen] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', title: '', message: '' });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [showReadReceipts, setShowReadReceipts] = useState(null); // messageId
  const [editingMessage, setEditingMessage] = useState(null);
  const { socket, sendMessage, sendTypingStart, sendTypingStop, markMessageRead } = useSocket();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const searchMatches = useMemo(() => {
    if (!searchQuery) return [];
    return messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [messages, searchQuery]);

  useEffect(() => {
    if (!chat || !socket) return;

    // Load messages
    loadMessages();

    // Join chat room
    if (chat.id) {
      console.log('Joining chat:', chat.id);
      socket.emit('join_chat', { chatId: chat.id });
    } else {
      console.error('Cannot join chat: chat.id is undefined', chat);
    }

    // Listen for new messages
    socket.on('receive_message', (newMessage) => {
      if (newMessage.chatId !== chat.id) return; // Only show messages for this chat
      setMessages((prev) => {
        if (!newMessage.id || prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    // Listen for message updates
    socket.on('message_updated', (updatedMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
      );
    });

    // Listen for typing
    socket.on('typing_start', ({ chatId: incomingChatId, user: typingUser }) => {
      if (incomingChatId === chat.id && typingUser.id !== user?.id) {
        setTypingUsers((prev) => [...new Set([...prev, typingUser.username])]);
      }
    });

    socket.on('typing_stop', ({ chatId: incomingChatId, user: typingUser }) => {
      if (incomingChatId === chat.id && typingUser.id !== user?.id) {
        setTypingUsers((prev) => prev.filter((u) => u !== typingUser.username));
      }
    });

    // Listen for profile updates to update message sender avatars
    socket.on('user_profile_updated', ({ userId, user: updatedUser }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.sender?.id === userId) {
            return {
              ...m,
              sender: { ...m.sender, avatar: updatedUser.avatar }
            };
          }
          return m;
        })
      );
    });

    return () => {
      socket.emit('leave_chat', { chatId: chat.id });
      socket.off('receive_message');
      socket.off('message_updated');
      socket.off('typing_start');
      socket.off('typing_stop');
      socket.off('user_profile_updated');
    };
  }, [chat, socket, user]);

  const loadMessages = async () => {
    try {
      const data = await chatService.getMessages(chat.id);
      setMessages(data.messages || []);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (messageData) => {
    try {
      if (editingMessage) {
        const updatedMessage = await chatService.editMessage(editingMessage.id, messageData.content);
        setMessages((prev) =>
          prev.map((m) => (m.id === editingMessage.id ? updatedMessage : m))
        );
        setEditingMessage(null);
        toast.success('Message updated');
        return;
      }

      if (messageData.isScheduled) {
        await chatService.scheduleMessage(chat.id, messageData);
        toast.success('Message scheduled successfully');
        return;
      }

      const message = await chatService.sendMessage({
        ...messageData,
        chatId: chat.id,
        senderId: user.id,
        replyToId: replyingTo?.id,
      });
      sendMessage(message);
      setReplyingTo(null);
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    } catch (error) {
      toast.error(editingMessage ? 'Failed to update message' : 'Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await chatService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  const handlePinMessage = async (messageId) => {
    try {
      const updatedChat = await chatService.pinMessage(chat.id, messageId);
      onChatUpdated?.(updatedChat);
      toast.success('Message pinned');
    } catch (error) {
      toast.error('Failed to pin message');
    }
  };

  const handleUnpinMessage = async () => {
    try {
      const updatedChat = await chatService.unpinMessage(chat.id);
      onChatUpdated?.(updatedChat);
      toast.success('Message unpinned');
    } catch (error) {
      toast.error('Failed to unpin message');
    }
  };

  const handleOpenThread = (id) => {
    setThreadId(id);
    setThreadOpen(true);
  };

  const handleMembersAdded = () => {
    // Reload chat to get updated member list
    loadMessages();
  };

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(notificationsEnabled ? 'Notifications muted' : 'Notifications enabled');
  };

  const handleClearHistory = () => {
    setConfirmModal({
      isOpen: true,
      type: 'clear',
      title: 'Clear Chat History',
      message: 'Are you sure you want to clear all messages in this chat? This action cannot be undone.'
    });
  };

  const handleLeaveChat = () => {
    setConfirmModal({
      isOpen: true,
      type: 'leave',
      title: 'Leave Chat',
      message: 'Are you sure you want to leave this chat?'
    });
  };

  const handleDeleteChat = () => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      title: 'Delete Chat',
      message: 'Are you sure you want to delete this chat? This action cannot be undone.'
    });
  };

  const handleConfirmAction = async () => {
    const { type } = confirmModal;
    setConfirmModal({ isOpen: false, type: '', title: '', message: '' });

    try {
      if (type === 'clear') {
        await chatService.clearMessages(chat?.id);
        setMessages([]);
        toast.success('Chat history cleared');
      } else if (type === 'leave') {
        await chatService.removeMember(chat?.id, user?.id);
        toast.success('Left chat successfully');
        onChatDeleted?.();
      } else if (type === 'delete') {
        await chatService.deleteChat(chat?.id);
        toast.success('Chat deleted successfully');
        onChatDeleted?.();
      }
    } catch (error) {
      console.error(`Failed to ${type} chat:`, error);
      const errorMessage = error.response?.data?.message || error.message || `Failed to ${type} chat`;
      toast.error(errorMessage);
    }
  };

  const handleCancelAction = () => {
    setConfirmModal({ isOpen: false, type: '', title: '', message: '' });
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-tg-bg">
        <div className="text-center flex flex-col items-center justify-center">
          <p className="text-tg-secondary">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-tg-chat">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b bg-tg-bg border-tg-border">
        <button onClick={onBack} className="lg:hidden p-2 text-tg-secondary hover:text-tg-primary">
          <ArrowLeft size={24} />
        </button>
        {(() => {
          // For private chats, find the other user
          const otherUser = chat.type === 'PRIVATE' && chat.members?.length === 2
            ? chat.members.find(m => (m.userId || m.id) !== user?.id)
            : null;
          
          // Try multiple possible property names for the username
          const displayName = otherUser?.username || otherUser?.name || otherUser?.user?.username || chat.name;
          const displayChar = displayName?.[0]?.toUpperCase();
          const isOnline = otherUser?.isOnline || otherUser?.user?.isOnline;
          
          return (
            <>
              <div className="w-10 h-10 rounded-full bg-tg-primary-gradient flex items-center justify-center relative">
                <span className="text-white font-medium">{displayChar}</span>
                {isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-tg-green rounded-full border-2 border-tg-bg"></div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-tg-text">{displayName}</h2>
                <p className="text-sm text-tg-secondary">
                  {otherUser ? (isOnline ? 'Online' : 'Offline') : chat.type}
                </p>
              </div>
            </>
          );
        })()}
        <div className="flex gap-2">
          {(chat.type === 'GROUP' || chat.type === 'CHANNEL') && (
            <button
              onClick={() => setShowAddMembers(true)}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
              title="Add members"
            >
              <UserPlus size={20} />
            </button>
          )}
          
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isSearchOpen 
                ? 'bg-tg-primary text-white' 
                : 'text-tg-secondary hover:text-tg-text hover:bg-tg-chat'
            }`}
            title="Search in chat"
          >
            <MagnifyingGlass size={20} />
          </button>

          {/* More Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
              title="More options"
            >
              <DotsThreeVertical size={20} />
            </button>
            {showMoreOptions && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMoreOptions(false)} />
                <div className={`absolute right-0 top-full mt-1 w-48 rounded-lg shadow-xl z-50 py-1 ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
                  <button
                    onClick={() => {
                      setShowChatInfo(true);
                      setShowMoreOptions(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-left ${theme === 'dark' ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'}`}
                  >
                    <Info size={16} />
                    Chat Info
                  </button>
                  <button
                    onClick={() => {
                      handleToggleNotifications();
                      setShowMoreOptions(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-left ${theme === 'dark' ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'}`}
                  >
                    {notificationsEnabled ? <BellSlash size={16} /> : <Bell size={16} />}
                    {notificationsEnabled ? 'Mute Notifications' : 'Unmute Notifications'}
                  </button>
                  <div className={`border-t my-1 ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`} />
                  <button
                    onClick={() => {
                      handleClearHistory();
                      setShowMoreOptions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <Trash size={16} />
                    Clear History
                  </button>
                  {chat.type !== 'PRIVATE' && (
                    <button
                      onClick={() => {
                        handleLeaveChat();
                        setShowMoreOptions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <SignOut size={16} />
                      Leave Chat
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDeleteChat();
                      setShowMoreOptions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <Trash size={16} />
                    Delete Chat
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pinned Message Bar */}
      {chat.pinnedMessage && (
        <div className={`px-4 py-2 flex items-center justify-between gap-3 border-b ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-amber-50 border-amber-100'}`}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-amber-500">
              <PushPin size={18} weight="fill" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Pinned Message</p>
              <p className={`text-xs truncate ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                {chat.pinnedMessage.content || 'Attachment'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleUnpinMessage}
            className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-white hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-amber-100'}`}
            title="Unpin"
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      {isSearchOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={`px-4 py-2 border-b flex items-center gap-3 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
        >
          <MagnifyingGlass size={18} className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (searchMatches.length > 0) {
                  setSearchIndex((prev) => (prev > 0 ? prev - 1 : searchMatches.length - 1));
                }
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (searchMatches.length > 0) {
                  setSearchIndex((prev) => (prev < searchMatches.length - 1 ? prev + 1 : 0));
                }
              } else if (e.key === 'Escape') {
                setIsSearchOpen(false);
                setSearchQuery('');
                setSearchIndex(0);
              }
            }}
            placeholder="Search in conversation..."
            className={`flex-1 bg-transparent border-none outline-none text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            autoFocus
          />
          {searchQuery && (
            <div className="flex items-center gap-1 border-l border-slate-700 pl-3">
              <span className={`text-[10px] font-medium mr-2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                {searchMatches.length > 0 
                  ? `${searchIndex + 1} of ${searchMatches.length}`
                  : '0 matches'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (searchMatches.length > 0) {
                      setSearchIndex((prev) => (prev > 0 ? prev - 1 : searchMatches.length - 1));
                    }
                  }}
                  className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-200 text-gray-500'}`}
                >
                  <CaretUp size={14} />
                </button>
                <button
                  onClick={() => {
                    if (searchMatches.length > 0) {
                      setSearchIndex((prev) => (prev < searchMatches.length - 1 ? prev + 1 : 0));
                    }
                  }}
                  className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-200 text-gray-500'}`}
                >
                  <CaretDown size={14} />
                </button>
              </div>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSearchIndex(0);
                }}
                className={`p-1 rounded-full ml-2 ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-200 text-gray-500'}`}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={user?.id}
        typingUsers={typingUsers}
        onOpenThread={handleOpenThread}
        onEdit={handleEditMessage}
        onDelete={handleDeleteMessage}
        searchQuery={searchQuery}
        searchIndex={searchIndex}
        searchMatches={searchMatches}
        onPin={handlePinMessage}
        onReply={(msg) => setReplyingTo(msg)}
        onForward={(msg) => setForwardingMessage(msg)}
        onShowReadReceipts={(id) => setShowReadReceipts(id)}
      />

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingStart={() => sendTypingStart(chat.id)}
        onTypingStop={() => sendTypingStop(chat.id)}
        editingMessage={editingMessage}
        onCancelEdit={handleCancelEdit}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />

      {/* Thread View */}
      <ThreadView
        isOpen={threadOpen}
        onClose={() => setThreadOpen(false)}
        threadId={threadId}
        currentUserId={user?.id}
      />

      {/* Add Members Modal */}
      <AddMembersModal
        isOpen={showAddMembers}
        onClose={() => setShowAddMembers(false)}
        chatId={chat?.id}
        onMembersAdded={handleMembersAdded}
      />

      {/* Chat Info Modal */}
      <ChatInfoModal
        isOpen={showChatInfo}
        onClose={() => setShowChatInfo(false)}
        chat={chat}
        messages={messages}
        onChatDeleted={onChatDeleted}
        onChatUpdated={onChatUpdated}
      />

      {/* Forward Modal */}
      <ForwardModal
        isOpen={!!forwardingMessage}
        onClose={() => setForwardingMessage(null)}
        message={forwardingMessage}
      />

      <ReadReceiptsModal
        isOpen={!!showReadReceipts}
        onClose={() => setShowReadReceipts(null)}
        messageId={showReadReceipts}
      />

      {/* Confirm Action Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={handleCancelAction}
        title={confirmModal.title}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-300">{confirmModal.message}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancelAction}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAction}
              className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatWindow;

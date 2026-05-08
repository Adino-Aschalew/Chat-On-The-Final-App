import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Dropdown from '../ui/Dropdown';
import { Users, Hash, Gear, SignOut, Trash, BellSlash, Bell, UserPlus, Crown, Shield, X, Image, File, Link as LinkIcon, Sparkle, Info, Lock, Eye, EyeSlash, ChatCircle, Envelope, User } from '@phosphor-icons/react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { chatService } from '../../services/chatService';
import api from '../../services/api';
import { toast } from 'sonner';
import AddMembersModal from './AddMembersModal';

const ChatInfoModal = ({ isOpen, onClose, chat, messages = [], onChatDeleted, onChatUpdated }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('info'); // info, media, settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [chatData, setChatData] = useState(chat);
  const [userData, setUserData] = useState(null);

  // Update local chat data when prop changes
  useEffect(() => {
    setChatData(chat);
  }, [chat]);

  // Get the other user for private chats
  const getOtherUser = () => {
    if (chatData?.type === 'PRIVATE' && chatData?.members?.length === 2) {
      return chatData.members.find(m => (m.userId || m.id) !== user?.id);
    }
    return null;
  };

  // Fetch user data from backend when modal opens
  useEffect(() => {
    if (isOpen && chatData?.type === 'PRIVATE' && chatData?.members?.length === 2) {
      const otherMember = chatData.members.find(m => (m.userId || m.id) !== user?.id);
      if (otherMember?.userId || otherMember?.id) {
        fetchUserData(otherMember.userId || otherMember.id);
      }
    }
  }, [isOpen, chatData, user]);

  const fetchUserData = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      setUserData(response.data?.data || response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  // Check if current user is group owner/admin
  const isGroupOwner = chatData?.ownerId === user?.id || chatData?.createdBy === user?.id;

  const otherUser = getOtherUser();

  // Display info
  const displayName = userData?.username || otherUser?.username || otherUser?.name || otherUser?.user?.username || chatData?.name;
  const isOnline = userData?.isOnline || otherUser?.isOnline || otherUser?.user?.isOnline;

  const getChatIcon = () => {
    if (chatData?.type === 'CHANNEL') {
      return (
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br ${theme === 'dark' ? 'from-amber-500 to-orange-500' : 'from-purple-500 to-pink-500'} flex items-center justify-center shadow-2xl">
          <Hash size={40} className="text-white" />
        </div>
      );
    }
    if (chatData?.type === 'GROUP') {
      return (
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br ${theme === 'dark' ? 'from-green-500 to-teal-500' : 'from-emerald-500 to-teal-500'} flex items-center justify-center shadow-2xl">
          <Users size={40} className="text-white" />
        </div>
      );
    }
    // Private chat - show user's avatar or initial
    const initial = displayName?.[0]?.toUpperCase();
    return (
      <div className="w-20 h-20 flex justify-center text-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative shadow-2xl">
        {otherUser?.avatar ? (
          <img src={otherUser.avatar} alt={displayName} className="w-full h-full rounded-3xl object-cover" />
        ) : (
          <span className="text-white font-bold text-3xl">{initial}</span>
        )}
        {isOnline && (
          <div className="absolute -bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 ${theme === 'dark' ? 'border-slate-900' : 'border-white'}"></div>
        )}
      </div>
    );
  };

  const handleLeaveChat = async () => {
    if (!confirm('Are you sure you want to leave this chat?')) return;
    
    try {
      await chatService.removeMember(chatData?.id, user?.id);
      toast.success('Left chat successfully');
      onClose();
      onChatDeleted?.();
    } catch (error) {
      toast.error('Failed to leave chat');
    }
  };

  const handleDeleteChat = async () => {
    if (!confirm('Are you sure you want to delete this chat? This action cannot be undone.')) return;
    
    try {
      await chatService.deleteChat(chatData?.id);
      toast.success('Chat deleted successfully');
      onClose();
      onChatDeleted?.();
    } catch (error) {
      toast.error('Failed to delete chat');
    }
  };

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(notificationsEnabled ? 'Notifications muted' : 'Notifications enabled');
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await chatService.removeMember(chatData?.id, memberId);
      toast.success('Member removed successfully');
      onChatDeleted?.(); // Refresh chat data
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handleMembersAdded = () => {
    setShowAddMembers(false);
    onChatUpdated?.(); // Refresh chat data
  };

  const mediaMessages = messages.filter(m => m.fileUrl);
  const imageMessages = mediaMessages.filter(m => 
    m.messageType === 'IMAGE' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(m.fileUrl)
  );
  const fileMessages = mediaMessages.filter(m => 
    m.messageType === 'FILE' && !/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(m.fileUrl)
  );
  const linkMessages = messages.filter(m => 
    m.content && /https?:\/\/[^\s]+/.test(m.content)
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
        {/* Header with Profile Photo */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center overflow-hidden ${
              chatData?.type === 'CHANNEL' 
                ? theme === 'dark' ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' : 'bg-gradient-to-br from-purple-100 to-pink-100'
                : chatData?.type === 'GROUP'
                ? theme === 'dark' ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' : 'bg-gradient-to-br from-emerald-100 to-teal-100'
                : theme === 'dark' ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20' : 'bg-gradient-to-br from-blue-100 to-indigo-100'
            }`}>
              {chatData?.avatar || userData?.avatar || otherUser?.avatar ? (
                <img 
                  src={chatData?.avatar || userData?.avatar || otherUser?.avatar} 
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className={`text-4xl font-bold ${
                  chatData?.type === 'CHANNEL'
                    ? theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    : chatData?.type === 'GROUP'
                    ? theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                    : theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {displayName?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            {/* Animated ring */}
            <motion.div
              className={`absolute inset-0 rounded-3xl border-2 ${
                chatData?.type === 'CHANNEL'
                  ? theme === 'dark' ? 'border-purple-500/30' : 'border-purple-300'
                  : chatData?.type === 'GROUP'
                  ? theme === 'dark' ? 'border-emerald-500/30' : 'border-emerald-300'
                  : theme === 'dark' ? 'border-blue-500/30' : 'border-blue-300'
              }`}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{displayName}</h2>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} capitalize`}>{chatData?.type}</p>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className={`flex items-center justify-center gap-1 p-2 rounded-2xl ${
          theme === 'dark' ? 'bg-slate-800/50 border border-slate-700' : 'bg-gray-100 border border-gray-200'
        }`}>
          {[
            { id: 'info', label: 'Info', icon: Info },
            { id: 'media', label: 'Media', icon: Image },
            { id: 'settings', label: 'Settings', icon: Gear }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all relative ${
                activeSection === tab.id
                  ? theme === 'dark'
                    ? chatData?.type === 'CHANNEL'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : chatData?.type === 'GROUP'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : chatData?.type === 'CHANNEL'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : chatData?.type === 'GROUP'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : theme === 'dark'
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeSection === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`p-6 rounded-2xl ${
                  theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Envelope size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className={`flex items-center gap-3 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`}>
                      <Envelope size={18} />
                    </div>
                    <div>
                      <p className={`text-xs uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>Email</p>
                      <p className="text-sm">{userData?.email || otherUser?.email || chatData?.owner?.email || 'No email available'}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`}>
                      <Hash size={18} />
                    </div>
                    <div>
                      <p className={`text-xs uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>Type</p>
                      <p className="text-sm capitalize">{chatData?.type}</p>
                    </div>
                  </div>
                  {userData?.isOnline !== undefined && (
                    <div className={`flex items-center gap-3 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`}>
                        <Eye size={18} />
                      </div>
                      <div>
                        <p className={`text-xs uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>Status</p>
                        <p className="text-sm">{userData?.isOnline ? 'Online' : 'Offline'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Bio Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`p-6 rounded-2xl ${
                  theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <User size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                  {otherUser ? 'About' : 'Description'}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  {chatData?.description || (userData?.bio || otherUser?.bio || `This ${userData || otherUser ? 'user' : chatData?.type?.toLowerCase()} hasn't added a ${userData || otherUser ? 'bio' : 'description'} yet.`)}
                </p>
              </motion.div>

              {/* Members Section */}
              {(chatData?.type === 'GROUP' || chatData?.type === 'CHANNEL') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`p-6 rounded-3xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-gray-100/50 border border-gray-200'}`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        chatData?.type === 'CHANNEL'
                          ? theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                          : theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100'
                      }`}>
                        <Users size={24} className={
                          chatData?.type === 'CHANNEL'
                            ? theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                            : theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                        } />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Members</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                          {chatData?.members?.length || 0} {(chatData?.members?.length || 0) === 1 ? 'member' : 'members'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {isGroupOwner && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAddMembers(true)}
                      className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl transition-all mb-4 ${theme === 'dark' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 hover:from-amber-500/30 hover:to-orange-500/30' : 'bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 hover:from-purple-200 hover:to-pink-200'}`}
                    >
                      <UserPlus size={20} className={theme === 'dark' ? 'text-amber-400' : 'text-purple-600'} />
                      <span className={`font-semibold ${theme === 'dark' ? 'text-amber-400' : 'text-purple-600'}`}>Add Members</span>
                    </motion.button>
                  )}

                  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                    {chatData?.members?.map((member, index) => {
                      const memberId = member.userId || member.id;
                      const memberName = member.username || member.user?.username || member.name;
                      const isOwner = memberId === chatData?.ownerId || memberId === chatData?.createdBy;
                      const isCurrentUser = memberId === user?.id;
                      
                      return (
                        <motion.div
                          key={memberId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.05 }}
                          className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${
                          theme === 'dark' ? 'bg-slate-700/50 hover:bg-slate-600/50' : 'bg-white/50 hover:bg-gray-100'
                        }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar src={member.avatar || member.user?.avatar} alt={memberName} size="md" />
                              {isOwner && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                                  <Crown size={14} className="text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {memberName}
                                </p>
                                {isCurrentUser && <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-slate-600 text-slate-300' : 'bg-gray-200 text-gray-600'}`}>You</span>}
                              </div>
                              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                                {member.email || member.user?.email || ''}
                              </p>
                            </div>
                          </div>
                          
                          {isGroupOwner && !isOwner && !isCurrentUser && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemoveMember(memberId)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                              title="Remove member"
                            >
                              <X size={18} />
                            </motion.button>
                          )}
                        </motion.div>
                      );
                    })}
                    
                    {(!chatData?.members || chatData.members.length === 0) && (
                      <p className={`text-center py-8 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>No members yet</p>
                    )}
                  </div>
                </motion.div>
              )}

            </motion.div>
          )}
          
          {activeSection === 'media' && (
            <motion.div
              key="media"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
            >
              {/* Images */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    chatData?.type === 'CHANNEL'
                      ? theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                      : chatData?.type === 'GROUP'
                      ? theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100'
                      : theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                  }`}>
                    <Image size={20} className={
                      chatData?.type === 'CHANNEL'
                        ? theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                        : chatData?.type === 'GROUP'
                        ? theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                        : theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    } />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Images</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>{imageMessages.length} images</p>
                  </div>
                </div>
                {imageMessages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {imageMessages.map((m, i) => (
                      <motion.div 
                        key={m.id || i} 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        className="aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-lg"
                        onClick={() => window.open(m.fileUrl, '_blank')}
                      >
                        <img 
                          src={m.fileUrl} 
                          alt="media" 
                          className="w-full h-full object-cover hover:scale-110 transition-transform"
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-center py-12 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}
                  >
                    <Image size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No images shared yet</p>
                  </motion.div>
                )}
              </div>

              {/* Files */}
              <div>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <File size={24} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
                  Files ({fileMessages.length})
                </h3>
                {fileMessages.length > 0 ? (
                  <div className="space-y-2">
                    {fileMessages.map((m, i) => (
                      <motion.a
                        key={m.id || i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        href={m.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all group hover:scale-[1.02] ${theme === 'dark' ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br ${theme === 'dark' ? 'from-amber-500/20 to-orange-500/20' : 'from-blue-100 to-indigo-100'} flex items-center justify-center group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-colors">
                          <File size={24} className={theme === 'dark' ? 'text-amber-400' : 'text-blue-600'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{m.fileName || 'Untitled File'}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{(m.fileSize / 1024).toFixed(1)} KB</p>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-center py-12 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}
                  >
                    <File size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No files shared yet</p>
                  </motion.div>
                )}
              </div>

              {/* Links */}
              <div>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <LinkIcon size={24} className={theme === 'dark' ? 'text-amber-400' : 'text-blue-600'} />
                  Links ({linkMessages.length})
                </h3>
                {linkMessages.length > 0 ? (
                  <div className="space-y-2">
                    {linkMessages.map((m, i) => {
                      const link = m.content.match(/https?:\/\/[^\s]+/)?.[0];
                      return (
                        <motion.a
                          key={m.id || i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block p-4 rounded-2xl transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                          <p className={`font-semibold truncate mb-2 ${theme === 'dark' ? 'text-amber-400' : 'text-blue-600'}`}>{link}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'} italic`}>
                            Sent by {m.sender?.username || 'User'}
                          </p>
                        </motion.a>
                      );
                    })}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-center py-12 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}
                  >
                    <LinkIcon size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No links shared yet</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
          
          {activeSection === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Notifications */}
              <div className={`p-6 rounded-3xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-gray-100/50 border border-gray-200'}`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Bell size={24} className={theme === 'dark' ? 'text-amber-400' : 'text-blue-600'} />
                  Notifications
                </h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleToggleNotifications}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${theme === 'dark' ? 'bg-slate-700/50 hover:bg-slate-600/50' : 'bg-white hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    {notificationsEnabled ? <Bell size={20} className={theme === 'dark' ? 'text-amber-400' : 'text-blue-600'} /> : <BellSlash size={20} className={theme === 'dark' ? 'text-slate-400' : 'text-gray-400'} />}
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
                    </span>
                  </div>
                  <div className={`w-12 h-7 rounded-full p-1 transition-colors ${notificationsEnabled ? theme === 'dark' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500' : theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </motion.button>
              </div>

              {/* Danger Zone */}
              <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 text-red-500`}>
                  <Shield size={24} />
                  Danger Zone
                </h3>
                <div className="space-y-3">
                  {chatData?.type !== 'PRIVATE' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLeaveChat}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400"
                    >
                      <SignOut size={20} />
                      <span className="font-medium">Leave Chat</span>
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteChat}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400"
                  >
                    <Trash size={20} />
                    <span className="font-medium">Delete Chat</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
      
      <AddMembersModal
        isOpen={showAddMembers}
        onClose={() => setShowAddMembers(false)}
        chatId={chatData?.id}
        onMembersAdded={handleMembersAdded}
      />
    </>
  );
};

export default ChatInfoModal;

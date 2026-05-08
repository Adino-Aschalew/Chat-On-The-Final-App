import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chats,
  Plus,
  Hash,
  Gear,
  SignOut,
  Sun,
  Moon,
  MagnifyingGlass,
  Users,
  PushPin,
  DotsThree,
  X,
  User,
} from '@phosphor-icons/react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Avatar from '../ui/Avatar';
import CreateChatModal from './CreateChatModal';
import UserSearchModal from './UserSearchModal';
import ContactsModal from './ContactsModal';
import { formatTimestamp } from '../../utils/formatters';
import { chatService } from '../../services/chatService';
import { usersService } from '../../services/usersService';
import api from '../../services/api';

const Sidebar = ({ chats, activeChat, onChatSelect, onChatUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCreateChat, setShowCreateChat] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // users, groups, channels
  const [userAvatars, setUserAvatars] = useState({});
  const menuRef = useRef(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    console.log('Chats received:', chats);
    const loadUsers = async () => {
      try {
        const data = await usersService.getAllUsers();
        setUsers(data.users || []);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };
    loadUsers();
  }, [chats]);

  // Fetch user avatars for chat members
  useEffect(() => {
    const fetchUserAvatars = async () => {
      const avatarMap = {};
      
      for (const chat of chats) {
        if (chat.type === 'PRIVATE' && chat.members?.length === 2) {
          const otherMember = chat.members.find(m => (m.userId || m.id) !== user?.id);
          if (otherMember && !(otherMember.avatar || otherMember.user?.avatar)) {
            const userId = otherMember.userId || otherMember.id;
            try {
              const response = await api.get(`/users/${userId}`);
              const userData = response.data?.data || response.data;
              if (userData?.avatar) {
                avatarMap[userId] = userData.avatar;
              }
            } catch (error) {
              console.error(`Failed to fetch user ${userId}:`, error);
            }
          }
        }
      }
      
      if (Object.keys(avatarMap).length > 0) {
        setUserAvatars(prev => ({ ...prev, ...avatarMap }));
      }
    };

    if (chats.length > 0) {
      fetchUserAvatars();
    }
  }, [chats, user]);

  const filteredChats = chats.filter((chat) => {
    return chat.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredUsers = users.filter((u) => {
    return u.username?.toLowerCase().includes(searchQuery.toLowerCase()) && u.role !== 'ADMIN' && u.id !== user?.id;
  });

  const privateChats = filteredChats.filter(c => c.type === 'PRIVATE');
  const groupChats = filteredChats.filter(c => c.type === 'GROUP');
  const channelChats = filteredChats.filter(c => c.type === 'CHANNEL');

  const getUnreadCount = (chatList) => {
    const count = chatList.reduce((sum, c) => sum + (c.unreadCount || c.unread_count || 0), 0);
    return count;
  };

  const handlePinChat = async (chat) => {
    try {
      if (chat.isPinned) {
        await chatService.unpinChat(chat.id);
      } else {
        await chatService.pinChat(chat.id);
      }
      onChatUpdate?.();
    } catch (error) {
      console.error('Failed to update chat');
    }
  };

  const handleStartChat = async (selectedUser) => {
    try {
      const payload = {
        type: 'PRIVATE',
        name: selectedUser.username,
        memberIds: [selectedUser.id],
      };
      const newChat = await chatService.createChat(payload);
      onChatSelect(newChat);
      setShowMobileMenu(false);
    } catch (error) {
      console.error('Failed to create private chat:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  const getChatDisplayInfo = (chat) => {
    let name = chat.name;
    let avatar = null;
    let isOnline = false;

    // For private chats, find the other user
    if (chat.type === 'PRIVATE' && chat.members?.length === 2) {
      const otherMember = chat.members.find(m => (m.userId || m.id) !== user?.id);
      if (otherMember) {
        name = otherMember.username || otherMember.name || otherMember.user?.username || chat.name;
        avatar = otherMember.avatar || otherMember.user?.avatar || userAvatars[otherMember.userId || otherMember.id];
        isOnline = otherMember.isOnline || otherMember.user?.isOnline;
      }
    }

    return { name, avatar, isOnline };
  };

  const getChatAvatar = (chat) => {
    if (chat.type === 'CHANNEL') {
      return (
        <div className="w-12 h-12 rounded-full bg-tg-primary-gradient flex items-center justify-center flex-shrink-0">
          <Hash size={24} className="text-white" />
        </div>
      );
    }
    if (chat.type === 'GROUP') {
      return (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center flex-shrink-0">
          <Users size={24} className="text-white" />
        </div>
      );
    }

    // For private chats, show other user's avatar or initial
    const { name, avatar } = getChatDisplayInfo(chat);
    const initial = name?.[0]?.toUpperCase();

    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-medium text-lg">{initial}</span>
        )}
      </div>
    );
  };

  return (
    <>
      {!showMobileMenu && (
        <button
          onClick={() => setShowMobileMenu(true)}
          className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-gray-200 text-gray-900'}`}
        >
          <Chats size={24} />
        </button>
      )}

      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(showMobileMenu || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed lg:relative inset-y-0 left-0 z-60 w-[28rem] flex flex-col bg-tg-bg border-r border-tg-border shadow-2xl lg:shadow-none overflow-x-hidden"
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between gap-3 border-b border-tg-border">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full transition-colors relative z-10 bg-tg-chat text-tg-secondary hover:text-tg-primary"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 px-3 py-2 rounded-full w-full max-w-48 bg-tg-chat">
                  <MagnifyingGlass size={18} className="text-tg-secondary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="flex-1 bg-transparent outline-none text-sm text-tg-text placeholder-tg-secondary"
                  />
                </div>
              </div>
              {/* Mobile close button */}
              <button
                onClick={() => setShowMobileMenu(false)}
                className={`lg:hidden w-8 h-8 flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-300'}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
              <div className="flex gap-2">
                {[
                  { id: 'users', label: 'Users', icon: Users, count: getUnreadCount(privateChats) },
                  { id: 'groups', label: 'Groups', icon: Users, count: getUnreadCount(groupChats) },
                  { id: 'channels', label: 'Channels', icon: Hash, count: getUnreadCount(channelChats) },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? theme === 'dark' 
                          ? 'bg-blue-500  text-white shadow-lg' 
                          : 'bg-blue-500  text-white shadow-lg'
                        : theme === 'dark'
                          ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`ml-1 w-5 h-5 rounded-full flex items-center justify-center ${
                        activeTab === tab.id
                          ? 'bg-white/20'
                          : theme === 'dark' ? 'bg-blue-500' : 'bg-blue-500'
                      }`}>
                        <span className="text-[10px] font-bold text-white">{tab.count > 9 ? '9+' : tab.count}</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'users' && (
                <>
                  {privateChats.length === 0 && filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 p-8 text-center">
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        No users found.
                      </p>
                    </div>
                  ) : (
                    <>
                      {privateChats.map((chat) => {
                        const chatInfo = getChatDisplayInfo(chat);
                        const unreadCount = chat.unreadCount || chat.unread_count || 0;
                        return (
                          <motion.button
                            key={chat.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => {
                              onChatSelect(chat);
                              setShowMobileMenu(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-all relative group ${
                              activeChat?.id === chat.id
                                ? theme === 'dark' 
                                  ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-l-4 border-blue-500' 
                                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500'
                                : theme === 'dark'
                                  ? 'hover:bg-slate-800/50'
                                  : 'hover:bg-gray-50'
                            }`}
                          >
                            {/* Pinned indicator */}
                            {chat.isPinned && (
                              <PushPin 
                                size={14} 
                                className={`flex-shrink-0 ${
                                  activeChat?.id === chat.id 
                                    ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                    : theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
                                }`} 
                              />
                            )}
                            
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              {getChatAvatar(chat)}
                              {chat.type === 'PRIVATE' && chat.isOnline && (
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                                  activeChat?.id === chat.id
                                    ? theme === 'dark' ? 'border-slate-800' : 'border-white'
                                    : theme === 'dark' ? 'border-slate-900' : 'border-white'
                                } bg-green-500 z-10`}></div>
                              )}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 text-left min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className={`font-semibold truncate flex-1 ${
                                  activeChat?.id === chat.id
                                    ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    : theme === 'dark' ? 'text-slate-200' : 'text-gray-800'
                                }`}>
                                  {chatInfo.name}
                                </p>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {/* Unread count */}
                                  {unreadCount > 0 && (
                                    <motion.div
                                      initial={{ scale: 0.8 }}
                                      animate={{ scale: 1 }}
                                      className={`px-2 py-1 text-xs font-bold rounded-full min-w-[24px] text-center ${
                                        activeChat?.id === chat.id
                                          ? theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
                                          : theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                                      }`}
                                    >
                                      {unreadCount > 99 ? '99+' : unreadCount}
                                    </motion.div>
                                  )}
                                  {/* Timestamp */}
                                  {chat.updatedAt && (
                                    <span className={`text-xs ${
                                      activeChat?.id === chat.id
                                        ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                        : theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
                                    }`}>
                                      {formatTimestamp(chat.updatedAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {/* Last message */}
                              <p className={`text-sm truncate ${
                                activeChat?.id === chat.id
                                  ? theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                                  : theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                              }`}>
                                {chat.lastMessage || 'No messages'}
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                      <div className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                        All Users
                      </div>
                      {filteredUsers.map((u) => (
                        <motion.button
                          key={u.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleStartChat(u)}
                          className={`w-full flex items-center gap-3 px-4 py-3 transition-all relative group ${
                            theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden">
                              <img
                                src={u.avatar}
                                alt={u.username}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className={`w-full h-full bg-gradient-to-br ${
                                theme === 'dark' ? 'from-blue-500 to-indigo-600' : 'from-blue-400 to-indigo-500'
                              } flex items-center justify-center`} style={{ display: 'none' }}>
                                <span className="text-white font-bold text-lg">{u.username?.[0]?.toUpperCase()}</span>
                              </div>
                            </div>
                            {u.isOnline && (
                              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                                theme === 'dark' ? 'border-slate-900' : 'border-white'
                              } bg-green-500 z-10`}></div>
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className={`font-semibold truncate ${
                              theme === 'dark' ? 'text-slate-200' : 'text-gray-800'
                            }`}>{u.username}</p>
                            <p className={`text-sm truncate ${
                              theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                            }`}>{u.email}</p>
                          </div>
                        </motion.button>
                      ))}
                    </>
                  )}
                </>
              )}

              {activeTab === 'groups' && (
                <>
                  {groupChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 p-8 text-center">
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        No groups yet.
                      </p>
                      <button
                        onClick={() => setShowCreateChat(true)}
                        className="mt-3 text-xs text-tg-primary hover:text-tg-primary/80 font-medium"
                      >
                        Create Group
                      </button>
                    </div>
                  ) : (
                    groupChats.map((chat) => {
                      const chatInfo = getChatDisplayInfo(chat);
                      return (
                        <button
                          key={chat.id}
                          onClick={() => {
                            onChatSelect(chat);
                            setShowMobileMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 transition-colors relative ${activeChat?.id === chat.id
                              ? theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
                              : theme === 'dark' ? 'hover:bg-slate-700/20' : 'hover:bg-gray-100'
                            }`}
                        >
                          {chat.isPinned && <PushPin size={12} className="text-tg-primary flex-shrink-0" />}
                          <div className="relative flex-shrink-0">
                            {getChatAvatar(chat)}
                            {chat.type === 'PRIVATE' && chat.isOnline && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-tg-bg z-11"></div>
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center justify-between flex-1 min-w-0">
                                <p className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{chatInfo.name}</p>
                                {(chat.unreadCount || chat.unread_count || 0) > 0 && (
                                  <span className="ml-2 px-2 py-0.5 text-xs font-bold text-white bg-tg-primary rounded-full min-w-[20px] text-center z-10">
                                    {(chat.unreadCount || chat.unread_count) > 99 ? '99+' : (chat.unreadCount || chat.unread_count)}
                                  </span>
                                )}
                              </div>
                              {chat.updatedAt && (
                                <span className={`text-[11px] flex-shrink-0 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                                  {formatTimestamp(chat.updatedAt)}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm truncate ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{chat.lastMessage || 'No messages'}</p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </>
              )}

              {activeTab === 'channels' && (
                <>
                  {channelChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 p-8 text-center">
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        No channels yet.
                      </p>
                      <button
                        onClick={() => setShowCreateChat(true)}
                        className="mt-3 text-xs text-tg-primary hover:text-tg-primary/80 font-medium"
                      >
                        Create a channel
                      </button>
                    </div>
                  ) : (
                    channelChats.map((chat) => {
                      const chatInfo = getChatDisplayInfo(chat);
                      return (
                        <button
                          key={chat.id}
                          onClick={() => {
                            onChatSelect(chat);
                            setShowMobileMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 transition-colors relative ${activeChat?.id === chat.id
                              ? theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
                              : theme === 'dark' ? 'hover:bg-slate-700/20' : 'hover:bg-gray-100'
                            }`}
                        >
                          {chat.isPinned && <PushPin size={12} className="text-tg-primary flex-shrink-0" />}
                          <div className="relative flex-shrink-0">
                            {getChatAvatar(chat)}
                            {chat.type === 'PRIVATE' && chat.isOnline && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-tg-green rounded-full border-2 border-tg-bg z-11"></div>
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center justify-between flex-1 min-w-0">
                                <p className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{chatInfo.name}</p>
                                {(chat.unreadCount || chat.unread_count || 0) > 0 && (
                                  <span className="ml-2 px-2 py-0.5 text-xs font-bold text-white bg-tg-green rounded-full min-w-[20px] text-center z-10">
                                    {(chat.unreadCount || chat.unread_count) > 99 ? '99+' : (chat.unreadCount || chat.unread_count)}
                                  </span>
                                )}
                              </div>
                              {chat.updatedAt && (
                                <span className={`text-[11px] flex-shrink-0 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                                  {formatTimestamp(chat.updatedAt)}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm truncate ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{chat.lastMessage || 'No messages'}</p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-tg-border">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/profile/${user?.id}`)}
                  title="View your profile"
                >
                  <Avatar
                    src={user?.avatar}
                    alt={user?.username}
                    className="w-10 h-10"
                  />
                </div>
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => navigate(`/profile/${user?.id}`)}
                >
                  <p className="font-medium truncate text-tg-text hover:text-tg-primary transition-colors">{user?.username}</p>
                  <p className="text-xs truncate text-tg-secondary">{user?.email}</p>
                </div>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-full transition-colors hover:bg-tg-chat text-tg-secondary hover:text-tg-text"
                  >
                    <DotsThree size={20} />
                  </button>
                  {showMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 rounded-[12px] shadow-xl border bg-tg-bg border-tg-border overflow-hidden">
                      <button
                        onClick={() => { navigate(`/profile/${user?.id}`); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-tg-text hover:bg-tg-chat transition-colors"
                      >
                        <User size={20} />
                        My Profile
                      </button>
                      <button
                        onClick={() => setShowCreateChat(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-tg-text hover:bg-tg-chat transition-colors"
                      >
                        <Plus size={20} />
                        New Chat
                      </button>
                      <button
                        onClick={() => setShowUserSearch(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-tg-text hover:bg-tg-chat transition-colors"
                      >
                        <MagnifyingGlass size={20} />
                        Search Users
                      </button>
                      <button
                        onClick={() => setShowContacts(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-tg-text hover:bg-tg-chat transition-colors"
                      >
                        <Users size={20} />
                        Contacts
                      </button>
                      <div className="border-t border-tg-border"></div>
                      <button
                        onClick={() => navigate('/settings')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-tg-text hover:bg-tg-chat transition-colors"
                      >
                        <Gear size={20} />
                        Settings
                      </button>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <SignOut size={20} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <CreateChatModal
        isOpen={showCreateChat}
        onClose={() => setShowCreateChat(false)}
        onChatCreated={(chat) => onChatSelect(chat)}
      />
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
      />
      <ContactsModal
        isOpen={showContacts}
        onClose={() => setShowContacts(false)}
      />
    </>
  );
};

export default Sidebar;

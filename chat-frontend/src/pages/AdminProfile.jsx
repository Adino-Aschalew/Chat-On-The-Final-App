import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Link as LinkIcon,
  Pencil,
  Trash,
  ChatCircle,
  Users,
  Shield,
  X,
  Camera,
  User,
  Envelope,
  ChartLineUp,
  ChatText,
} from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSocket } from '../contexts/SocketContext';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import BackButton from '../components/ui/BackButton';
import { chatService } from '../services/chatService';
import api from '../services/api';
import { fileService } from '../services/fileService';
import { toast } from 'sonner';
import { useAvatarUpload } from '../hooks/useAvatarUpload';

/* ─── Inline editable field ─────────────────────────────────── */
const EditableField = ({ value, onSave, multiline = false, placeholder, theme }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');

  const save = async () => {
    await onSave(draft);
    setEditing(false);
  };
  const cancel = () => { setDraft(value || ''); setEditing(false); };

  if (!editing) {
    return (
      <div
        className="group flex items-start gap-2 cursor-pointer"
        onClick={() => { setDraft(value || ''); setEditing(true); }}
      >
        <span className={value ? '' : 'italic opacity-40'}>{value || placeholder}</span>
        <PencilSimple
          size={14}
          className={`opacity-0 group-hover:opacity-60 transition-opacity ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
          }`}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {multiline ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className={`w-full p-2 rounded-lg border resize-none ${
            theme === 'dark'
              ? 'bg-slate-700 border-slate-600 text-white'
              : 'bg-gray-50 border-gray-300 text-gray-900'
          }`}
          rows={3}
          placeholder={placeholder}
          autoFocus
        />
      ) : (
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className={`w-full p-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-slate-700 border-slate-600 text-white'
              : 'bg-gray-50 border-gray-300 text-gray-900'
          }`}
          placeholder={placeholder}
          autoFocus
        />
      )}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={save}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-medium"
        >
          <Check size={14} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={cancel}
          className={`px-3 py-1 rounded-lg text-sm font-medium ${
            theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <X size={14} />
        </motion.button>
      </div>
    </div>
  );
};

/* ─── Avatar upload button ───────────────────────────────────── */
const AvatarUploadButton = ({ onUpload, uploading, theme }) => (
  <label className="absolute bottom-0 right-0 z-30 cursor-pointer">
    <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`bottom-2 right-2 w-9 h-9 rounded-full bg-gradient-to-r ${theme === 'dark' ? 'from-amber-500 to-orange-500' : 'from-purple-500 to-indigo-600'} flex items-center justify-center shadow-lg border-2 ${theme === 'dark' ? 'border-slate-900' : 'border-white'} ${
        uploading ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      {uploading ? (
        <Spinner size={16} className="text-white animate-spin" />
      ) : (
        <Camera size={16} className="text-white" weight="fill" />
      )}
    </motion.div>
  </label>
);

/* ─── Main component ─────────────────────────────────────────── */
const AdminProfile = () => {
  const { userId } = useParams();
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChats: 0,
    totalMessages: 0,
    activeUsers: 0,
    systemHealth: 95,
  });
  const menuRef = useRef(null);

  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const { theme } = useTheme();

  const isAdminProfile = currentUser?.role === 'ADMIN' && (!userId || String(userId) === String(currentUser.id));

  const { uploading, avatarPreview, handleAvatarUpload, resetPreview } = useAvatarUpload((avatarUrl) => {
    setAdminUser(prev => ({ ...prev, avatar: avatarUrl }));
    if (isAdminProfile) {
      updateUser({ avatar: avatarUrl });
    }
  });

  // Avatar handling
  const avatarSrc = avatarPreview || adminUser?.avatar || currentUser?.avatar;

  // Save field
  const saveField = async (field, value) => {
    try {
      await updateUser({ [field]: value });
      setAdminUser(prev => prev ? { ...prev, [field]: value } : null);
      toast.success(`${field} updated successfully`);
    } catch (error) {
      toast.error(`Failed to update ${field}`);
    }
  };

  // Load admin data
  useEffect(() => {
    const load = async () => {
      try {
        if (isAdminProfile) {
          setAdminUser(currentUser);
        } else {
          const res = await api.get(`/users/${userId}`);
          setAdminUser(res.data?.data || res.data);
        }

        // Load admin stats
        try {
          const statsResponse = await api.get('/admin/stats');
          const data = statsResponse.data?.data || statsResponse.data;
          setStats({
            totalUsers: data?.totalUsers || 0,
            totalChats: data?.totalChats || 0,
            totalMessages: data?.totalMessages || 0,
            activeUsers: data?.onlineUsers || 0,
            systemHealth: data?.systemHealth || 95,
          });
        } catch (statsError) {
          console.error('Failed to load admin stats:', statsError);
        }
      } catch (error) {
        toast.error('Failed to load admin profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, currentUser, isAdminProfile]);

  // Menu handlers
  const handleShareProfile = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Profile link copied to clipboard');
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <Spinner size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Loading admin profile...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <Shield size={48} className={theme === 'dark' ? 'text-slate-600' : 'text-gray-400'} />
          <p className={`mt-4 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Admin profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'} relative`}>
      <BackButton to="/admin" className="absolute top-4 left-4 z-20" />

      {/* Header Section with Admin Cover */}
      <div className="relative">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 overflow-hidden">
          <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-amber-600/20 to-orange-600/20' : 'bg-gradient-to-br from-amber-400/30 to-orange-400/30'}`} />
          <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-t from-slate-900 via-transparent to-transparent' : 'bg-gradient-to-t from-white via-transparent to-transparent'}`} />
          
          {/* Admin Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-amber-500/10 to-transparent" />
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl" />
          </div>
          
          {/* Admin Badge */}
          <div className="absolute top-4 right-4">
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${
              theme === 'dark' ? 'bg-amber-500/20 border-amber-500/30' : 'bg-amber-100 border-amber-300'
            } border`}>
              <Crown size={16} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
                System Administrator
              </span>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="relative px-4 md:px-8 pb-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row gap-8 -mt-20 md:-mt-24"
            >
              {/* Avatar Section */}
              <div className="flex flex-col items-center md:items-start">
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="relative"
                  >
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={adminUser.username}
                        className={`w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 ${theme === 'dark' ? 'border-slate-800 shadow-2xl' : 'border-white shadow-2xl'}`}
                      />
                    ) : (
                      <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br ${theme === 'dark' ? 'from-amber-500 to-orange-600' : 'from-amber-400 to-orange-500'} border-4 ${theme === 'dark' ? 'border-slate-800 shadow-2xl' : 'border-white shadow-2xl'} flex items-center justify-center`}>
                        <span className="text-white font-bold text-4xl md:text-5xl">
                          {adminUser.username?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Admin Crown Badge */}
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-amber-500' : 'bg-amber-400'
                    } shadow-lg`}>
                      <Crown size={16} className="text-white" />
                    </div>
                    
                    {/* Upload Button */}
                    {isAdminProfile && (
                      <AvatarUploadButton onUpload={handleAvatarUpload} uploading={uploading} theme={theme} />
                    )}
                  </motion.div>
                </div>

                {/* Admin Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`mt-8 px-6 py-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-gray-200'}`}
                >
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="px-4 py-3">
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalUsers}</p>
                      <p className="text-xs uppercase tracking-wider mt-1">Users</p>
                    </div>
                    <div className="px-4 py-3">
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.activeUsers}</p>
                      <p className="text-xs uppercase tracking-wider mt-1">Active</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                {/* Name and Actions */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {isAdminProfile ? (
                          <div className="text-3xl md:text-4xl font-bold">
                            <EditableField
                              value={adminUser.username}
                              onSave={v => saveField('username', v)}
                              placeholder="Admin Username"
                              theme={theme}
                            />
                          </div>
                        ) : (
                          <h1 className={`text-3xl md:text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {adminUser.username}
                          </h1>
                        )}
                        <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${
                          theme === 'dark' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-600 border-amber-200'
                        } border text-xs font-semibold`}>
                          <Crown size={12} />
                          ADMIN
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
                          {adminUser.email}
                        </span>
                        <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                          <Calendar size={14} />
                          Joined {adminUser.createdAt ? new Date(adminUser.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`w-2 h-2 rounded-full bg-green-500`} />
                        <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                          System Administrator
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3" ref={menuRef}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleShareProfile}
                        className={`px-4 py-2.5 rounded-xl border font-medium transition-all flex items-center gap-2 ${
                          theme === 'dark' ? 'bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <ShareNetwork size={18} />
                        Share
                      </motion.button>
                      
                      <div className="relative">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowMenu(m => !m)}
                          className={`px-4 py-2.5 rounded-xl border font-medium transition-all flex items-center gap-2 ${
                            theme === 'dark' ? 'bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <DotsThree size={20} />
                        </motion.button>

                        <AnimatePresence>
                          {showMenu && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -4 }}
                              className={`absolute top-full right-0 mt-2 rounded-2xl shadow-xl border z-50 min-w-[180px] overflow-hidden ${
                                theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                              }`}
                            >
                              <button
                                onClick={() => { navigate('/admin'); setShowMenu(false); }}
                                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors ${
                                  theme === 'dark' ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                <ChartBar size={16} /> Admin Dashboard
                              </button>
                              <button
                                onClick={() => { navigate('/admin/users'); setShowMenu(false); }}
                                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors ${
                                  theme === 'dark' ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                <Users size={16} /> Manage Users
                              </button>
                              <button
                                onClick={() => { navigate('/settings'); setShowMenu(false); }}
                                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors ${
                                  theme === 'dark' ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                <Gear size={16} /> Settings
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Admin Bio Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`rounded-2xl p-6 border mb-6 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}
                >
                  <h2 className={`font-semibold flex items-center gap-2 mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Shield size={18} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} /> Admin Bio
                  </h2>
                  {isAdminProfile ? (
                    <EditableField
                      value={adminUser.bio}
                      onSave={v => saveField('bio', v)}
                      multiline
                      placeholder="Tell us about your role as system administrator..."
                      theme={theme}
                    />
                  ) : (
                    <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} text-sm leading-relaxed`}>
                      {adminUser.bio || 'This administrator hasn\'t added a bio yet.'}
                    </p>
                  )}
                </motion.div>

                {/* System Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`rounded-2xl p-6 border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}
                >
                  <h2 className={`font-semibold flex items-center gap-2 mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <ChartLineUp size={18} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} /> System Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                          <Users size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                        </div>
                        <div>
                          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalUsers}</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Total Users</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                          <ChatCircle size={20} className={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} />
                        </div>
                        <div>
                          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalChats}</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Total Chats</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                          <ChartLineUp size={20} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                        </div>
                        <div>
                          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalMessages}</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Messages</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
                          <ChartLineUp size={20} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                        </div>
                        <div>
                          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.systemHealth}%</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>System Health</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Admin Privileges */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className={`rounded-2xl p-6 border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}
                >
                  <h2 className={`font-semibold flex items-center gap-2 mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Lock size={18} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} /> Admin Privileges
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <Users size={20} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>User Management</p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Full access to user accounts</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <ChartBar size={20} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Analytics</p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>System-wide analytics access</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <Shield size={20} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Security</p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Security settings and monitoring</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <Gear size={20} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>System Settings</p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Complete system configuration</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

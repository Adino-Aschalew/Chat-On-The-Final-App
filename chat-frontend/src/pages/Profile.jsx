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
          weight="bold"
          className="opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0 mt-0.5 text-tg-primary"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {multiline ? (
        <textarea
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={4}
          placeholder={placeholder}
          className={`w-full rounded-xl px-3 py-2 text-sm resize-none outline-none border focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
          }`}
        />
      ) : (
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl px-3 py-2 text-sm outline-none border focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
          }`}
        />
      )}
      <div className="flex gap-2">
        <button
          onClick={save}
          className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-lg hover:brightness-110 transition-all flex items-center gap-1"
        >
          <Check size={12} weight="bold" /> Save
        </button>
        <button
          onClick={cancel}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Cancel
        </button>
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
      className={`bottom-2 right-2 w-9 h-9 rounded-full bg-gradient-to-r ${theme === 'dark' ? 'from-amber-500 to-orange-500' : 'from-blue-500 to-indigo-600'} flex items-center justify-center shadow-lg border-2 ${theme === 'dark' ? 'border-slate-900' : 'border-white'} ${
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
const Profile = () => {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [stats, setStats] = useState({ chats: 0, followers: 0 });
  const menuRef = useRef(null);

  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const { theme } = useTheme();

  const isOwnProfile = currentUser && String(userId) === String(currentUser.id);

  const { uploading, avatarPreview, handleAvatarUpload, resetPreview } = useAvatarUpload((avatarUrl) => {
    setProfileUser(prev => ({ ...prev, avatar: avatarUrl }));
    if (isOwnProfile) {
      updateUser({ avatar: avatarUrl });
    }
  });

  /* ── load profile ── */
  useEffect(() => {
    const load = async () => {
      try {
        // Load profile data
        if (isOwnProfile) {
          setProfileUser(currentUser);
        } else {
          const res = await api.get(`/users/${userId}`);
          setProfileUser(res.data?.data || res.data);
        }

        // Load stats data
        try {
          const targetUserId = isOwnProfile ? currentUser?.id : userId;
          if (targetUserId) {
            // Fetch user's chats
            const chatsData = await chatService.getChats();
            const userChats = chatsData.chats || chatsData || [];
            const chatsArray = Array.isArray(userChats) ? userChats : [];
            
            // Count different chat types
            const privateChats = chatsArray.filter(chat => chat.type === 'PRIVATE').length;
            const groupChats = chatsArray.filter(chat => chat.type === 'GROUP').length;
            const channelChats = chatsArray.filter(chat => chat.type === 'CHANNEL').length;
            
            // For now, followers is a placeholder - could be implemented later
            const followersCount = 0;
            
            setStats({ 
              chats: privateChats, 
              groups: groupChats, 
              channels: channelChats,
              followers: followersCount 
            });
          }
        } catch (statsError) {
          console.error('Failed to load stats:', statsError);
          // Set default stats on error
          setStats({ chats: 0, groups: 0, channels: 0, followers: 0 });
        }
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (userId || isOwnProfile) load();
    else setLoading(false);
  }, [userId, currentUser]);

  /* keep own profile in sync with context changes */
  useEffect(() => {
    if (isOwnProfile && currentUser) setProfileUser({ ...currentUser });
  }, [currentUser]);

  /* close menu on outside click */
  useEffect(() => {
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── inline field save ── */
  const saveField = async (field, value) => {
    try {
      const res = await api.put('/auth/profile', { [field]: value });
      const updated = res.data?.data || { [field]: value };
      updateUser({ [field]: updated[field] ?? value });
      setProfileUser(prev => ({ ...prev, [field]: updated[field] ?? value }));
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to save changes');
    }
  };

  /* ── start chat ── */
  const handleStartChat = async () => {
    try {
      const res = await api.post('/chats', { type: 'PRIVATE', name: profileUser.username, memberIds: [profileUser.id] });
      navigate('/dashboard');
      toast.success(`Chat started with ${profileUser.username}`);
    } catch { toast.error('Failed to start chat'); }
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profile link copied!');
  };

  /* ── avatar src ── */
  const avatarSrc = avatarPreview || profileUser?.avatar;

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="flex flex-col items-center gap-3">
        <div className={`w-10 h-10 border-4 ${theme === 'dark' ? 'border-amber-500' : 'border-blue-500'} border-t-transparent rounded-full animate-spin`} />
        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Loading profile…</p>
      </div>
    </div>
  );

  if (!profileUser) return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <p className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Profile not found</p>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'} relative`}>
      <BackButton to="/dashboard" className="absolute top-4 left-4 z-20" />

      {/* Header Section with Cover */}
      <div className="relative">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 overflow-hidden">
          <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-blue-600/20 to-indigo-600/20' : 'bg-gradient-to-br from-blue-400/30 to-indigo-400/30'}`} />
          <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-t from-slate-900 via-transparent to-transparent' : 'bg-gradient-to-t from-white via-transparent to-transparent'}`} />
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/10 to-transparent" />
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
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
                        alt={profileUser.username}
                        className={`w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 ${theme === 'dark' ? 'border-slate-800 shadow-2xl' : 'border-white shadow-2xl'}`}
                      />
                    ) : (
                      <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br ${theme === 'dark' ? 'from-blue-500 to-indigo-600' : 'from-blue-400 to-indigo-500'} border-4 ${theme === 'dark' ? 'border-slate-800 shadow-2xl' : 'border-white shadow-2xl'} flex items-center justify-center`}>
                        <span className="text-white font-bold text-4xl md:text-5xl">
                          {profileUser.username?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Online Status */}
                    <div className={`absolute bottom-3 right-3 w-5 h-5 rounded-full border-3 ${theme === 'dark' ? 'border-slate-800' : 'border-white'} z-20 shadow-lg ${
                      profileUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    
                    {/* Upload Button */}
                    {isOwnProfile && (
                      <AvatarUploadButton onUpload={handleAvatarUpload} uploading={uploading} theme={theme} />
                    )}
                  </motion.div>
                </div>

                {/* Quick Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`mt-8 px-6 py-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-gray-200'}`}
                >
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div className="px-4 py-3">
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.chats}</p>
                      <p className="text-xs uppercase tracking-wider mt-1">Chats</p>
                    </div>
                    <div className="px-4 py-3">
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.groups || 0}</p>
                      <p className="text-xs uppercase tracking-wider mt-1">Groups</p>
                    </div>
                    <div className="px-4 py-3">
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.channels || 0}</p>
                      <p className="text-xs uppercase tracking-wider mt-1">Channels</p>
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
                        {isOwnProfile ? (
                          <div className="text-3xl md:text-4xl font-bold">
                            <EditableField
                              value={profileUser.username}
                              onSave={v => saveField('username', v)}
                              placeholder="Add username"
                              theme={theme}
                            />
                          </div>
                        ) : (
                          <h1 className={`text-3xl md:text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {profileUser.username}
                          </h1>
                        )}
                        {profileUser.role === 'ADMIN' && (
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${theme === 'dark' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-600 border-amber-200'} border`}>
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
                          {profileUser.email}
                        </span>
                        <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                          <Calendar size={14} />
                          Joined {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`w-2 h-2 rounded-full ${profileUser.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                          {profileUser.isOnline ? 'Online now' : 'Last seen recently'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3" ref={menuRef}>
                      {!isOwnProfile && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleStartChat}
                          className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          <ChatCircle size={18} weight="fill" />
                          Message
                        </motion.button>
                      )}
                      
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
                                onClick={() => { handleShareProfile(); setShowMenu(false); }}
                                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors ${
                                  theme === 'dark' ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                <ShareNetwork size={16} /> Share Profile
                              </button>
                              {!isOwnProfile && (
                                <button
                                  onClick={() => { handleStartChat(); setShowMenu(false); }}
                                  className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors ${
                                    theme === 'dark' ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-50'
                                  }`}
                                >
                                  <ChatCircle size={16} /> Message
                                </button>
                              )}
                              <button
                                className="w-full px-4 py-3 text-left text-sm text-red-500 flex items-center gap-3 hover:bg-red-50 transition-colors"
                              >
                                <Shield size={16} /> Report
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Bio Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`rounded-2xl p-6 border mb-6 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}
                >
                  <h2 className={`font-semibold flex items-center gap-2 mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <User size={18} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} /> About
                  </h2>
                  {isOwnProfile ? (
                    <EditableField
                      value={profileUser.bio}
                      onSave={v => saveField('bio', v)}
                      multiline
                      placeholder="Tell us about yourself..."
                      theme={theme}
                    />
                  ) : (
                    <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} text-sm leading-relaxed`}>
                      {profileUser.bio || 'This user hasn\'t added a bio yet.'}
                    </p>
                  )}
                </motion.div>

                {/* Contact Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`rounded-2xl p-6 border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}
                >
                  <h2 className={`font-semibold flex items-center gap-2 mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Envelope size={18} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} /> Contact Information
                  </h2>
                  <div className="space-y-4">
                    <div className={`flex items-center gap-3 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`}>
                        <Envelope size={18} />
                      </div>
                      <div>
                        <p className={`text-xs uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>Email</p>
                        <p className="text-sm">{profileUser.email}</p>
                      </div>
                    </div>
                    
                    {profileUser.location && (
                      <div className={`flex items-center gap-3 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`}>
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className={`text-xs uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>Location</p>
                          <p className="text-sm">{profileUser.location}</p>
                        </div>
                      </div>
                    )}
                    
                    {profileUser.website && (
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`}>
                          <Globe size={18} className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} />
                        </div>
                        <div>
                          <p className={`text-xs uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>Website</p>
                          <a 
                            href={profileUser.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`text-sm ${theme === 'dark' ? 'text-blue-400 hover:underline' : 'text-blue-600 hover:underline'}`}
                          >
                            {profileUser.website}
                          </a>
                        </div>
                      </div>
                    )}
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

export default Profile;

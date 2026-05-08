import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { useSocket } from '../contexts/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Sun, Moon, Shield, SignOut, Gear, Pencil, Lock, Globe, ChatCircle, Info, Camera, Clock, Users, Eye, UploadSimple } from '@phosphor-icons/react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import BackButton from '../components/ui/BackButton';
import { toast } from 'sonner';
import api from '../services/api';
import { fileService } from '../services/fileService';
import { useAvatarUpload } from '../hooks/useAvatarUpload';

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { permission, requestPermission } = useNotification();
  const { emitProfileUpdate } = useSocket();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });
  const [loading, setLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    messageSound: true,
    messagePreview: true,
    groupNotifications: true,
  });
  const [privacySettings, setPrivacySettings] = useState({
    readReceipts: true,
    lastSeen: 'everyone',
    profilePhoto: 'everyone',
  });

  const { uploading, avatarPreview, handleAvatarUpload, resetPreview } = useAvatarUpload((avatarUrl) => {
    setProfileData({ ...profileData, avatar: avatarUrl });
    updateUser({ avatar: avatarUrl });
    emitProfileUpdate();
  });

  // Load user settings from backend
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const response = await api.get('/auth/settings');
        const data = response.data?.data || response.data;
        if (data) {
          if (data.notificationSettings) {
            setNotificationSettings(data.notificationSettings);
          }
          if (data.privacySettings) {
            setPrivacySettings(data.privacySettings);
          }
        }
      } catch (error) {
        console.error('Failed to load user settings:', error);
        // Keep default values if backend fails
      }
    };
    loadUserSettings();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/auth/profile', profileData);
      updateUser(profileData);
      emitProfileUpdate();
      toast.success('Profile updated successfully');
      setShowEditProfile(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPermission = async () => {
    const token = await requestPermission();
    if (token) {
      toast.success('Notifications enabled');
    }
  };

  const handleSaveNotificationSettings = () => {
    toast.success('Notification settings saved');
    setShowNotificationSettings(false);
  };

  const handleSavePrivacySettings = () => {
    toast.success('Privacy settings saved');
    setShowPrivacySettings(false);
  };

  return (
    <div className={`min-h-screen p-4 relative ${theme === 'dark' ? 'bg-[#17212b]' : 'bg-gray-100'}`}>
      <BackButton to="/dashboard" />
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${theme === 'dark' ? 'bg-[#242f3d]' : 'bg-white'} rounded-xl overflow-hidden mb-4`}
        >
          <button
            onClick={() => setShowEditProfile(true)}
            className={`w-full flex items-center gap-4 p-4 transition-colors text-left ${theme === 'dark' ? 'hover:bg-[#2b3a4a]' : 'hover:bg-gray-200'}`}
          >
            <div className="relative">
              <Avatar src={user?.avatar} alt={user?.username} size="lg" />
              <div className={`absolute top-6 right-[-10px] w-7 h-7 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-[#3390ec]' : 'bg-blue-500'}`}>
                <Camera size={18} className="text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user?.username}</h2>
              <p className={`text-sm truncate ${theme === 'dark' ? 'text-[#8e9ba8]' : 'text-gray-500'}`}>{user?.email}</p>
            </div>
            <Pencil size={20} className={theme === 'dark' ? 'text-[#8e9ba8]' : 'text-gray-400'} />
          </button>
        </motion.div>

        {/* Settings Sections */}
        <div className={`${theme === 'dark' ? 'bg-[#242f3d]' : 'bg-white'} rounded-xl overflow-hidden mb-4`}>
          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center gap-4 p-4 transition-colors text-left border-b ${theme === 'dark' ? 'hover:bg-[#2b3a4a] border-[#17212b]' : 'hover:bg-gray-100 border-gray-200'}`}
            >
              <div className="w-10 h-10 rounded-full bg-[#3390ec]/20 flex items-center justify-center flex-shrink-0">
                {theme === 'dark' ? <Moon size={20} className="text-[#3390ec]" /> : <Sun size={20} className="text-[#3390ec]" />}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Dark Mode</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-[#8e9ba8]' : 'text-gray-500'}`}>{theme === 'dark' ? 'Currently enabled' : 'Currently disabled'}</p>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-[#3390ec]' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </button>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <button
              onClick={() => setShowNotificationSettings(true)}
              className={`w-full flex items-center gap-4 p-4 transition-colors text-left border-b ${theme === 'dark' ? 'hover:bg-[#2b3a4a] border-[#17212b]' : 'hover:bg-gray-100 border-gray-200'}`}
            >
              <div className="w-10 h-10 rounded-full bg-[#3390ec]/20 flex items-center justify-center flex-shrink-0">
                <Bell size={20} className="text-[#3390ec]" />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Notifications</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-[#8e9ba8]' : 'text-gray-500'}`}>Message sounds, previews, and alerts</p>
              </div>
            </button>
          </motion.div>

          {/* Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={() => setShowPrivacySettings(true)}
              className={`w-full flex items-center gap-4 p-4 transition-colors text-left border-b ${theme === 'dark' ? 'hover:bg-[#2b3a4a] border-[#17212b]' : 'hover:bg-gray-100 border-gray-200'}`}
            >
              <div className="w-10 h-10 rounded-full bg-[#3390ec]/20 flex items-center justify-center flex-shrink-0">
                <Lock size={20} className="text-[#3390ec]" />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Privacy</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-[#8e9ba8]' : 'text-gray-500'}`}>Read receipts, last seen, profile visibility</p>
              </div>
            </button>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <button className={`w-full flex items-center gap-4 p-4 transition-colors text-left ${theme === 'dark' ? 'hover:bg-[#2b3a4a]' : 'hover:bg-gray-100'}`}>
              <div className="w-10 h-10 rounded-full bg-[#3390ec]/20 flex items-center justify-center flex-shrink-0">
                <Info size={20} className="text-[#3390ec]" />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>About</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-[#8e9ba8]' : 'text-gray-500'}`}>Version 1.0.0</p>
              </div>
            </button>
          </motion.div>
        </div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${theme === 'dark' ? 'bg-[#242f3d]' : 'bg-white'} rounded-xl overflow-hidden`}
        >
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 p-4 hover:bg-red-500/20 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <SignOut size={20} className="text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-red-400 font-medium">Sign Out</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-[#8e9ba8]' : 'text-gray-500'}`}>Log out of your account</p>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} title="">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className={`w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center ${theme === 'dark' ? 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20' : 'bg-gradient-to-br from-blue-100 to-indigo-100'}`}>
              <User size={32} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Profile</h2>
            <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} mt-1`}>Update your profile information</p>
          </div>

          {/* Form */}
          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Input
                label="Username"
                type="text"
                name="username"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Input
                label="Email"
                type="email"
                name="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
            >
              <label className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2 mb-3`}>
                <Camera size={18} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar src={profileData.avatar} alt={profileData.username} size="xl" />
                  <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${theme === 'dark' ? 'border-slate-900 bg-blue-500' : 'border-white bg-blue-500'}`}>
                    <Camera size={14} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all font-medium ${
                      uploadingAvatar 
                        ? theme === 'dark' ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : theme === 'dark' 
                          ? 'bg-gradient-to-r from-blue-500/20 to-indigo-600/20 border border-blue-500/30 text-blue-400 hover:from-blue-500/30 hover:to-indigo-600/30' 
                          : 'bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-300 text-blue-600 hover:from-blue-200 hover:to-indigo-200'
                    }`}
                  >
                    {uploadingAvatar ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadSimple size={18} />
                        Upload New
                      </>
                    )}
                  </label>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'} mt-2`}>
                    JPG, PNG, GIF up to 5MB
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowEditProfile(false)} className="flex-1">
                Cancel
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </motion.div>
            </div>
          </form>
        </div>
      </Modal>

      {/* Notification Settings Modal */}
      <Modal isOpen={showNotificationSettings} onClose={() => setShowNotificationSettings(false)} title="">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className={`w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center ${theme === 'dark' ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' : 'bg-gradient-to-br from-amber-100 to-orange-100'}`}>
              <Bell size={32} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
            </div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Notification Settings</h2>
            <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} mt-1`}>Customize your notification preferences</p>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-gray-100/50 border border-gray-200'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'}`}>
                    <Bell size={20} className={theme === 'dark' ? 'text-amber-400' : 'text-blue-600'} />
                  </div>
                  <div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Message Sounds</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Play sound for new messages</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setNotificationSettings({ ...notificationSettings, messageSound: !notificationSettings.messageSound })}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${notificationSettings.messageSound ? theme === 'dark' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500' : theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'}`}
                >
                  <motion.div
                    animate={{ x: notificationSettings.messageSound ? 20 : 0 }}
                    className="w-5 h-5 bg-white rounded-full shadow-lg"
                  />
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-gray-100/50 border border-gray-200'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'}`}>
                    <Eye size={20} className={theme === 'dark' ? 'text-amber-400' : 'text-blue-600'} />
                  </div>
                  <div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Message Preview</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Show message preview in notifications</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setNotificationSettings({ ...notificationSettings, messagePreview: !notificationSettings.messagePreview })}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${notificationSettings.messagePreview ? theme === 'dark' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500' : theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'}`}
                >
                  <motion.div
                    animate={{ x: notificationSettings.messagePreview ? 20 : 0 }}
                    className="w-5 h-5 bg-white rounded-full shadow-lg"
                  />
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-gray-100/50 border border-gray-200'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'}`}>
                    <Users size={20} className={theme === 'dark' ? 'text-amber-400' : 'text-blue-600'} />
                  </div>
                  <div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Group Notifications</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Notify for group messages</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setNotificationSettings({ ...notificationSettings, groupNotifications: !notificationSettings.groupNotifications })}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${notificationSettings.groupNotifications ? theme === 'dark' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500' : theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'}`}
                >
                  <motion.div
                    animate={{ x: notificationSettings.groupNotifications ? 20 : 0 }}
                    className="w-5 h-5 bg-white rounded-full shadow-lg"
                  />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowNotificationSettings(false)} className="flex-1">
              Cancel
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button onClick={handleSaveNotificationSettings} className="w-full">
                Save Changes
              </Button>
            </motion.div>
          </div>
        </div>
      </Modal>

      {/* Privacy Settings Modal */}
      <Modal isOpen={showPrivacySettings} onClose={() => setShowPrivacySettings(false)} title="">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className={`w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center ${theme === 'dark' ? 'bg-gradient-to-br from-green-500/20 to-teal-500/20' : 'bg-gradient-to-br from-green-100 to-teal-100'}`}>
              <Lock size={32} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
            </div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Privacy Settings</h2>
            <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} mt-1`}>Control your privacy and visibility</p>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-gray-100/50 border border-gray-200'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'}`}>
                    <Eye size={20} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                  </div>
                  <div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Read Receipts</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Show when you've read messages</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPrivacySettings({ ...privacySettings, readReceipts: !privacySettings.readReceipts })}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${privacySettings.readReceipts ? 'bg-gradient-to-r from-green-500 to-teal-500' : theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'}`}
                >
                  <motion.div
                    animate={{ x: privacySettings.readReceipts ? 20 : 0 }}
                    className="w-5 h-5 bg-white rounded-full shadow-lg"
                  />
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-gray-100/50 border border-gray-200'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'}`}>
                  <Clock size={20} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                </div>
                <div>
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Last Seen</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Control who can see your last seen status</p>
                </div>
              </div>
              <select
                value={privacySettings.lastSeen}
                onChange={(e) => setPrivacySettings({ ...privacySettings, lastSeen: e.target.value })}
                className={`w-full p-3 rounded-xl border-2 outline-none transition-all ${theme === 'dark' ? 'bg-slate-700 text-white border-slate-600 focus:border-green-500' : 'bg-white text-gray-900 border-gray-200 focus:border-green-500'}`}
              >
                <option value="everyone">Everyone</option>
                <option value="contacts">My Contacts</option>
                <option value="nobody">Nobody</option>
              </select>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-gray-100/50 border border-gray-200'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'}`}>
                  <User size={20} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                </div>
                <div>
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Profile Photo</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Control who can see your profile photo</p>
                </div>
              </div>
              <select
                value={privacySettings.profilePhoto}
                onChange={(e) => setPrivacySettings({ ...privacySettings, profilePhoto: e.target.value })}
                className={`w-full p-3 rounded-xl border-2 outline-none transition-all ${theme === 'dark' ? 'bg-slate-700 text-white border-slate-600 focus:border-green-500' : 'bg-white text-gray-900 border-gray-200 focus:border-green-500'}`}
              >
                <option value="everyone">Everyone</option>
                <option value="contacts">My Contacts</option>
                <option value="nobody">Nobody</option>
              </select>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowPrivacySettings(false)} className="flex-1">
              Cancel
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button onClick={handleSavePrivacySettings} className="w-full">
                Save Changes
              </Button>
            </motion.div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;

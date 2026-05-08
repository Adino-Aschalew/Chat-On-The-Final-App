import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Bell,
  Sun,
  Moon,
  Shield,
  SignOut,
  Gear,
  Pencil,
  Lock,
  Globe,
  ChatCircle,
  Info,
  Camera,
  Clock,
  Users,
  Eye,
  UploadSimple,
  Monitor,
  Database,
  Key,
  WarningCircle,
  CheckCircle,
  ArrowRight,
  Palette,
  Notification,
  Fingerprint,
  Envelope,
  Password,
  UserSwitch,
  HardDrive,
  Cloud,
  Lightning,
  Magnet,
  Broom,
  Trash,
  Download,
  Upload,
  Spinner,
} from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { useSocket } from '../contexts/SocketContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import BackButton from '../components/ui/BackButton';
import { toast } from 'sonner';
import api from '../services/api';
import { useAvatarUpload } from '../hooks/useAvatarUpload';

// Delete Account Modal Component
const DeleteAccountModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const { theme } = useTheme();
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Account" size="md">
      <div className="space-y-4">
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          theme === 'dark' ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
        }`}>
          <WarningCircle size={32} className={theme === 'dark' ? 'text-red-400' : 'text-red-600'} />
          <div>
            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              This action cannot be undone
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
              All your data will be permanently deleted
            </p>
          </div>
        </div>

        <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
          Are you sure you want to delete your admin account? This will:
        </p>

        <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
          <li className="flex items-center gap-2">
            <X size={16} className="text-red-500" />
            Permanently delete your account
          </li>
          <li className="flex items-center gap-2">
            <X size={16} className="text-red-500" />
            Remove all your data from the system
          </li>
          <li className="flex items-center gap-2">
            <X size={16} className="text-red-500" />
            Revoke all admin privileges
          </li>
        </ul>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const AdminSettings = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { permission, requestPermission } = useNotification();
  const { socket } = useSocket();
  const navigate = useNavigate();

  // Profile states
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  // System settings states
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    maxUsers: 1000,
    messageRetention: 30,
    autoBackup: true,
    debugMode: false,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 24,
    passwordMinLength: 8,
    requireEmailVerification: true,
    maxLoginAttempts: 5,
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    systemAlerts: true,
    userReports: true,
    securityAlerts: true,
  });

  // UI states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);

  const { uploading, avatarPreview, handleAvatarUpload, resetPreview } = useAvatarUpload((avatarUrl) => {
    setProfileData(prev => ({ ...prev, avatar: avatarUrl }));
    updateUser({ avatar: avatarUrl });
  });

  // Load system settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/settings');
        const data = response.data?.data || response.data;
        if (data) {
          setSystemSettings(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Failed to load admin settings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Load security settings from backend
  useEffect(() => {
    const loadSecuritySettings = async () => {
      try {
        const response = await api.get('/admin/security-settings');
        const data = response.data?.data || response.data;
        if (data) {
          setSecuritySettings(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Failed to load security settings:', error);
      }
    };
    loadSecuritySettings();
  }, []);

  // Save profile changes
  const saveProfileChanges = async () => {
    setLoading(true);
    try {
      await updateUser(profileData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await api.delete('/auth/account');
      toast.success('Account deleted successfully');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Save system settings
  const saveSystemSettings = async () => {
    setLoading(true);
    try {
      await api.put('/admin/settings', systemSettings);
      toast.success('System settings updated successfully');
    } catch (error) {
      toast.error('Failed to update system settings');
    } finally {
      setLoading(false);
    }
  };

  // Save security settings
  const saveSecuritySettings = async () => {
    setLoading(true);
    try {
      await api.put('/admin/security-settings', securitySettings);
      toast.success('Security settings updated successfully');
    } catch (error) {
      toast.error('Failed to update security settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/admin/change-password', {
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
    } catch (error) {
      console.error('Failed to change password:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to change password';
      toast.error(errorMessage);
    }
  };

  // System actions
  const handleSystemMaintenance = async () => {
    try {
      const response = await api.post('/admin/maintenance', { enabled: !systemSettings.maintenanceMode });
      setSystemSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }));
      toast.success(`Maintenance mode ${!systemSettings.maintenanceMode ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to toggle maintenance mode');
    }
  };

  const handleBackupSystem = async () => {
    try {
      const response = await api.post('/admin/backup');
      toast.success('System backup completed successfully');
    } catch (error) {
      toast.error('Failed to backup system');
    }
  };

  const handleClearCache = async () => {
    try {
      await api.post('/admin/clear-cache');
      toast.success('System cache cleared successfully');
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  const sections = [
    { id: 'profile', label: 'Admin Profile', icon: User },
    { id: 'system', label: 'System Settings', icon: Gear },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'} relative`}>
      <BackButton to="/admin" className="absolute top-4 left-4 z-20" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'
            }`}>
              <Gear size={32} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Admin Settings
              </h1>
              <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                Manage your admin profile and system configuration
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className={`flex gap-2 p-2 rounded-2xl ${
            theme === 'dark' ? 'bg-slate-800/50 border border-slate-700' : 'bg-gray-100 border border-gray-200'
          }`}>
            {sections.map((section) => (
              <motion.button
                key={section.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeSection === section.id
                    ? theme === 'dark'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : theme === 'dark'
                      ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <section.icon size={18} />
                <span>{section.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className={`rounded-2xl p-6 border ${
                theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <User size={24} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
                  Admin Profile Information
                </h2>

                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <Avatar src={profileData.avatar} alt={profileData.username} size="xl" />
                    <div className={`absolute top-6 right-[-10px] w-7 h-7 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-amber-500' : 'bg-amber-500'
                    }`}>
                      <Camera size={18} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Profile Picture
                    </h3>
                    <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      Upload a professional profile picture for your admin account
                    </p>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'
                          : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200'
                      } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {uploading ? (
                          <>
                            <Spinner size={16} className="animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <UploadSimple size={16} />
                            Upload New
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                      Admin Username
                    </label>
                    <Input
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter admin username"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                    Admin Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about your role and responsibilities..."
                    rows={4}
                    className={`w-full p-3 rounded-lg border resize-none ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setProfileData({
                      username: user?.username || '',
                      email: user?.email || '',
                      bio: user?.bio || '',
                      avatar: user?.avatar || '',
                    })}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={saveProfileChanges}
                    disabled={loading}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className={`rounded-2xl p-6 border ${
                theme === 'dark' ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
              }`}>
                <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                  <WarningCircle size={24} />
                  Danger Zone
                </h2>
                <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(true)}
                  className={`border-red-500 text-red-500 hover:bg-red-500 hover:text-white ${
                    theme === 'dark' ? 'border-red-400 text-red-400 hover:bg-red-400 hover:text-white' : ''
                  }`}
                >
                  <Trash size={16} className="mr-2" />
                  Delete Account
                </Button>
              </div>
            </motion.div>
          )}

          {/* System Settings Section */}
          {activeSection === 'system' && (
            <motion.div
              key="system"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className={`rounded-2xl p-6 border ${
                theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Monitor size={24} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
                  System Configuration
                </h2>

                <div className="space-y-6">
                  {/* Maintenance Mode */}
                  <div className="flex items-center justify-between p-4 rounded-xl border">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
                      }`}>
                        <WarningCircle size={20} className={theme === 'dark' ? 'text-red-400' : 'text-red-600'} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Maintenance Mode
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                          Temporarily disable user access to the system
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSystemMaintenance}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        systemSettings.maintenanceMode
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : theme === 'dark'
                            ? 'bg-slate-700 text-white hover:bg-slate-600'
                            : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                      }`}
                    >
                      {systemSettings.maintenanceMode ? 'Disable' : 'Enable'}
                    </button>
                  </div>

                  {/* User Registration */}
                  <div className="flex items-center justify-between p-4 rounded-xl border">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}>
                        <UserSwitch size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          User Registration
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                          Allow new users to register for accounts
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSystemSettings(prev => ({ ...prev, allowRegistrations: !prev.allowRegistrations }))}
                      className={`w-12 h-7 rounded-full p-1 transition-colors ${
                        systemSettings.allowRegistrations
                          ? theme === 'dark' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          : theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'
                      }`}
                    >
                      <motion.div
                        animate={{ x: systemSettings.allowRegistrations ? 20 : 0 }}
                        className="w-5 h-5 bg-white rounded-full"
                      />
                    </motion.button>
                  </div>

                  {/* Max Users */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                      Maximum Users Limit
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        value={systemSettings.maxUsers}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, maxUsers: parseInt(e.target.value) || 1000 }))}
                        className={`flex-1 p-3 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}
                      />
                      <Users size={20} className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} />
                    </div>
                  </div>

                  {/* Message Retention */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                      Message Retention (days)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        value={systemSettings.messageRetention}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, messageRetention: parseInt(e.target.value) || 30 }))}
                        className={`flex-1 p-3 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}
                      />
                      <Clock size={20} className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <Button
                    onClick={saveSystemSettings}
                    disabled={loading}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    {loading ? 'Saving...' : 'Save System Settings'}
                  </Button>
                </div>
              </div>

              {/* System Actions */}
              <div className={`rounded-2xl p-6 border ${
                theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Lightning size={24} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
                  System Actions
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBackupSystem}
                    className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-600/50'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                    }`}>
                      <Download size={20} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                    </div>
                    <div className="text-left">
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Backup System
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                        Create system backup
                      </p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClearCache}
                    className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-600/50'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'
                    }`}>
                      <Broom size={20} className={theme === 'dark' ? 'text-orange-400' : 'text-orange-600'} />
                    </div>
                    <div className="text-left">
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Clear Cache
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                        Clear system cache
                      </p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-600/50'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                    }`}>
                      <Spinner size={20} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                    </div>
                    <div className="text-left">
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Restart System
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                        Restart services
                      </p>
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className={`rounded-2xl p-6 border ${
                theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Shield size={24} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
                  Security Configuration
                </h2>

                <div className="space-y-6">
                  {/* Password Settings */}
                  <div>
                    <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Password Policy
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                          Minimum Password Length
                        </label>
                        <input
                          type="number"
                          value={securitySettings.passwordMinLength}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) || 8 }))}
                          className={`w-full p-3 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-slate-700 border-slate-600 text-white'
                              : 'bg-gray-50 border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                          Max Login Attempts
                        </label>
                        <input
                          type="number"
                          value={securitySettings.maxLoginAttempts}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) || 5 }))}
                          className={`w-full p-3 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-slate-700 border-slate-600 text-white'
                              : 'bg-gray-50 border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Session Settings */}
                  <div>
                    <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Session Management
                    </h3>
                    <div className="flex items-center justify-between p-4 rounded-xl border">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                        }`}>
                          <Clock size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                        </div>
                        <div>
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Session Timeout
                          </h4>
                          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                            Auto-logout after {securitySettings.sessionTimeout} hours
                          </p>
                        </div>
                      </div>
                      <input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 24 }))}
                        className={`w-20 p-2 rounded-lg border text-center ${
                          theme === 'dark'
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Admin Password Change */}
                  <div className="p-4 rounded-xl border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
                        }`}>
                          <Password size={20} className={theme === 'dark' ? 'text-red-400' : 'text-red-600'} />
                        </div>
                        <div>
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Admin Password
                          </h4>
                          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                            Change your admin account password
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowPasswordModal(true)}
                        variant="outline"
                      >
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <Button
                    onClick={saveSecuritySettings}
                    disabled={loading}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    {loading ? 'Saving...' : 'Save Security Settings'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className={`rounded-2xl p-6 border ${
                theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Bell size={24} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
                  Admin Notifications
                </h2>

                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', icon: Envelope, description: 'Receive admin alerts via email' },
                    { key: 'pushNotifications', label: 'Push Notifications', icon: Notification, description: 'Get browser notifications for admin events' },
                    { key: 'systemAlerts', label: 'System Alerts', icon: WarningCircle, description: 'Critical system notifications' },
                    { key: 'userReports', label: 'User Reports', icon: Users, description: 'Notifications about user reports' },
                    { key: 'securityAlerts', label: 'Security Alerts', icon: Shield, description: 'Security-related notifications' },
                  ].map(({ key, label, icon: Icon, description }) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl border">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                        }`}>
                          <Icon size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                        </div>
                        <div>
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {label}
                          </h4>
                          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                            {description}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }))}
                        className={`w-12 h-7 rounded-full p-1 transition-colors ${
                          notificationSettings[key]
                            ? theme === 'dark' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                            : theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'
                        }`}
                      >
                        <motion.div
                          animate={{ x: notificationSettings[key] ? 20 : 0 }}
                          className="w-5 h-5 bg-white rounded-full"
                        />
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Admin Password">
            <PasswordChangeModal
              onSubmit={handlePasswordChange}
              onClose={() => setShowPasswordModal(false)}
            />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <DeleteAccountModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteAccount}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Password Change Modal Component
const PasswordChangeModal = ({ onSubmit, onClose }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData.currentPassword, formData.newPassword);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
          Current Password
        </label>
        <input
          type="password"
          value={formData.currentPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
          className={`w-full p-3 rounded-lg border ${
            theme === 'dark'
              ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="Enter current password"
          required
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
          New Password
        </label>
        <input
          type="password"
          value={formData.newPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
          className={`w-full p-3 rounded-lg border ${
            theme === 'dark'
              ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="Enter new password"
          required
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
          Confirm New Password
        </label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          className={`w-full p-3 rounded-lg border ${
            theme === 'dark'
              ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="Confirm new password"
          required
        />
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </Button>
      </div>
    </form>
  );
};

export default AdminSettings;

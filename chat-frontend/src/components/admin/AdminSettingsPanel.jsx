import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Gear, 
  User, 
  Shield, 
  Database, 
  Bell,
  ArrowRight
} from '@phosphor-icons/react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const AdminSettingsPanel = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const adminOptions = [
    {
      id: 'profile',
      title: 'Admin Profile',
      description: 'Manage your admin profile and personal settings',
      icon: User,
      action: () => navigate('/admin/profile'),
      color: 'blue'
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configure system-wide settings and preferences',
      icon: Gear,
      action: () => navigate('/admin/settings'),
      color: 'amber'
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Manage security settings and access controls',
      icon: Shield,
      action: () => navigate('/admin/settings'),
      color: 'green'
    },
    {
      id: 'database',
      title: 'Database',
      description: 'Backup, restore, and manage database operations',
      icon: Database,
      action: () => navigate('/admin/settings'),
      color: 'purple'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure admin notification preferences',
      icon: Bell,
      action: () => navigate('/admin/settings'),
      color: 'orange'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600',
      amber: theme === 'dark' ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600',
      green: theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600',
      purple: theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600',
      orange: theme === 'dark' ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className={`text-2xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Admin Center
        </h2>
        <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
          Welcome back, {user?.username || 'Admin'}. Manage your admin privileges and system settings.
        </p>
      </motion.div>

      {/* Admin Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminOptions.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={option.action}
            className={`p-6 rounded-2xl border text-left transition-all ${
              theme === 'dark'
                ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                getColorClasses(option.color)
              }`}>
                <option.icon size={24} />
              </div>
              <ArrowRight size={20} className={
                theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
              } />
            </div>
            
            <h3 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {option.title}
            </h3>
            
            <p className={`text-sm ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
            }`}>
              {option.description}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`mt-8 p-6 rounded-2xl border ${
          theme === 'dark' 
            ? 'bg-slate-800/50 border-slate-700' 
            : 'bg-white border-gray-200'
        }`}
      >
        <h3 className={`text-lg font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/admin/settings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            System Settings
          </button>
          <button
            onClick={() => navigate('/admin/profile')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-slate-700 text-white hover:bg-slate-600'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            View Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSettingsPanel;

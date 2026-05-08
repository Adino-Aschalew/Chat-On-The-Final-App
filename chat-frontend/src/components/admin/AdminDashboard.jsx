import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Users, ChartBar, SignOut, User, Gear, Sun, Moon, Shield } from '@phosphor-icons/react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import UserManagement from './UserManagement';
import AnalyticsChart from './AnalyticsChart';
import AdminManagement from './AdminManagement';
import BackButton from '../ui/BackButton';
import Avatar from '../ui/Avatar';

const AdminDashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('users');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: ChartBar },
    { id: 'admin', label: 'Admin', icon: Shield },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToProfile = () => {
    navigate('/admin/profile');
    setShowProfileMenu(false);
  };

  return (
    <div className={`min-h-screen relative ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <BackButton to="/dashboard" />
      <div className={`border-b ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-6">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Admin Dashboard</h1>
            
            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`p-3 rounded-xl transition-all ${
                theme === 'dark' 
                  ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
            
            {/* Profile Avatar Section */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                  theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                }`}
              >
                <div className="text-right">
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {user?.username || 'Admin'}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                    Administrator
                  </p>
                </div>
                <div className="relative">
                  <Avatar 
                    src={user?.avatar} 
                    alt={user?.username || 'Admin'} 
                    size="md"
                    className="ring-2 ring-amber-500/50 hover:ring-amber-500 transition-all"
                  />
                  {/* Online indicator */}
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 ${
                    theme === 'dark' ? 'border-slate-800' : 'border-white'
                  }`}></div>
                </div>
              </motion.button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className={`absolute top-full right-0 mt-2 w-56 rounded-2xl shadow-xl border z-50 overflow-hidden ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className={`p-4 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {user?.username || 'Admin User'}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                      {user?.email || 'No email'}
                    </p>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={() => { navigate('/admin/settings'); setShowProfileMenu(false); }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                        theme === 'dark' ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Gear size={16} /> Admin Settings
                    </button>
                    
                    <button
                      onClick={goToProfile}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                        theme === 'dark' ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <User size={18} />
                      <span>View Profile</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                        theme === 'dark' ? 'text-red-400 hover:bg-slate-700' : 'text-red-600 hover:bg-gray-50'
                      }`}
                    >
                      <SignOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'analytics' && <AnalyticsChart />}
        {activeTab === 'admin' && <AdminManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;

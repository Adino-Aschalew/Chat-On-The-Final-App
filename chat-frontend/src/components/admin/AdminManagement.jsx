import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash, 
  Prohibit, 
  CheckCircle, 
  Eye, 
  MagnifyingGlass,
  X,
  Shield,
  User,
  Clock,
  ChartLineUp,
  SignOut,
  Lock,
  LockOpen
} from '@phosphor-icons/react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { toast } from 'sonner';

const AdminManagement = () => {
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const [activeView, setActiveView] = useState('admins');
  const [admins, setAdmins] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);

  // Form state for new admin
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Fetch admins
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/admins');
      setAdmins(response.data?.data?.admins || []);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      toast.error('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin logs
  const fetchAdminLogs = async (adminId) => {
    try {
      const response = await api.get(`/admin/logs/${adminId}`);
      setLogs(response.data?.data?.logs || []);
    } catch (error) {
      console.error('Failed to fetch admin logs:', error);
      toast.error('Failed to fetch admin logs');
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Filter admins based on search
  const filteredAdmins = admins.filter(admin => 
    admin.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add new admin
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    
    if (newAdmin.password !== newAdmin.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newAdmin.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await api.post('/admin/admins', {
        username: newAdmin.username,
        email: newAdmin.email,
        password: newAdmin.password,
        role: 'ADMIN'
      });
      
      toast.success('Admin created successfully');
      setShowAddModal(false);
      setNewAdmin({ username: '', email: '', password: '', confirmPassword: '' });
      fetchAdmins();
    } catch (error) {
      console.error('Failed to create admin:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create admin';
      toast.error(errorMessage);
    }
  };

  // Delete admin
  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      await api.delete(`/admin/admins/${selectedAdmin.id}`);
      toast.success('Admin deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (error) {
      console.error('Failed to delete admin:', error);
      toast.error('Failed to delete admin');
    }
  };

  // Suspend/Unsuspend admin
  const handleToggleSuspend = async () => {
    if (!selectedAdmin) return;

    try {
      await api.put(`/admin/admins/${selectedAdmin.id}/suspend`, {
        suspended: !selectedAdmin.suspended
      });
      
      toast.success(selectedAdmin.suspended ? 'Admin unsuspended' : 'Admin suspended');
      setShowSuspendConfirm(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (error) {
      console.error('Failed to update admin status:', error);
      toast.error('Failed to update admin status');
    }
  };

  // View admin logs
  const handleViewLogs = async (admin) => {
    setSelectedAdmin(admin);
    await fetchAdminLogs(admin.id);
    setShowLogsModal(true);
  };

  // Stats
  const totalAdmins = admins.length;
  const activeAdmins = admins.filter(a => !a.suspended).length;
  const suspendedAdmins = admins.filter(a => a.suspended).length;

  return (
    <div className="p-6">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Shield size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{totalAdmins}</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Total Admins</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
              <CheckCircle size={20} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{activeAdmins}</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Active Admins</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'}`}>
              <Prohibit size={20} className={theme === 'dark' ? 'text-red-400' : 'text-red-600'} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{suspendedAdmins}</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Suspended</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
      >
        <div className="flex items-center gap-4">
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Admin Management
          </h2>
          <div className={`relative`}>
            <MagnifyingGlass size={20} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search admins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            theme === 'dark' 
              ? 'bg-amber-600 text-white hover:bg-amber-700' 
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          <Plus size={18} />
          Add Admin
        </motion.button>
      </motion.div>

      {/* Admins Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${theme === 'dark' ? 'border-slate-700 bg-slate-800/80' : 'border-gray-200 bg-gray-50'}`}>
                <th className={`text-left p-4 font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Admin</th>
                <th className={`text-left p-4 font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Email</th>
                <th className={`text-left p-4 font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Status</th>
                <th className={`text-left p-4 font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Last Active</th>
                <th className={`text-right p-4 font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className={`animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto ${theme === 'dark' ? 'border-slate-400' : 'border-gray-400'}`} />
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`p-8 text-center ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                    No admins found
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className={`border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-100'} hover:${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          admin.id === currentUser?.id 
                            ? (theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100')
                            : (theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200')
                        }`}>
                          <User size={18} className={
                            admin.id === currentUser?.id 
                              ? (theme === 'dark' ? 'text-amber-400' : 'text-amber-600')
                              : (theme === 'dark' ? 'text-slate-400' : 'text-gray-500')
                          } />
                        </div>
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {admin.username}
                            {admin.id === currentUser?.id && (
                              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                theme === 'dark' ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
                              }`}>
                                You
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`p-4 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
                      {admin.email}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        admin.suspended 
                          ? (theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600')
                          : (theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600')
                      }`}>
                        {admin.suspended ? (
                          <><Prohibit size={12} /> Suspended</>
                        ) : (
                          <><CheckCircle size={12} /> Active</>
                        )}
                      </span>
                    </td>
                    <td className={`p-4 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                      {admin.lastSeen ? new Date(admin.lastSeen).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleViewLogs(admin)}
                          className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-700' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'}`}
                          title="View Activity Logs"
                        >
                          <ChartLineUp size={18} />
                        </motion.button>

                        {admin.id !== currentUser?.id && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setShowSuspendConfirm(true);
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                admin.suspended
                                  ? (theme === 'dark' ? 'text-green-400 hover:bg-green-500/20' : 'text-green-600 hover:bg-green-100')
                                  : (theme === 'dark' ? 'text-yellow-400 hover:bg-yellow-500/20' : 'text-yellow-600 hover:bg-yellow-100')
                              }`}
                              title={admin.suspended ? "Unsuspend Admin" : "Suspend Admin"}
                            >
                              {admin.suspended ? <LockOpen size={18} /> : <Prohibit size={18} />}
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setShowDeleteConfirm(true);
                              }}
                              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20' : 'text-red-600 hover:text-red-700 hover:bg-red-100'}`}
                              title="Delete Admin"
                            >
                              <Trash size={18} />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Admin Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-2xl border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Add New Admin
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={newAdmin.username}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, username: e.target.value }))}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter email"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter password (min 8 chars)"
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={newAdmin.confirmPassword}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Confirm password"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-700 text-white hover:bg-slate-600'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                        : 'bg-amber-500 text-white hover:bg-amber-600'
                    }`}
                  >
                    Create Admin
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && selectedAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-2xl border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'}`}>
                  <Trash size={24} className={theme === 'dark' ? 'text-red-400' : 'text-red-600'} />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Delete Admin
                  </h3>
                </div>
              </div>

              <p className={`mb-6 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
                Are you sure you want to delete <span className="font-semibold">{selectedAdmin.username}</span>? 
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedAdmin(null);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-700 text-white hover:bg-slate-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAdmin}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  Delete Admin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Suspend Confirmation Modal */}
      <AnimatePresence>
        {showSuspendConfirm && selectedAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-2xl border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedAdmin.suspended 
                    ? (theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100')
                    : (theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100')
                }`}>
                  {selectedAdmin.suspended ? (
                    <LockOpen size={24} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                  ) : (
                    <Prohibit size={24} className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'} />
                  )}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedAdmin.suspended ? 'Unsuspend Admin' : 'Suspend Admin'}
                  </h3>
                </div>
              </div>

              <p className={`mb-6 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
                {selectedAdmin.suspended 
                  ? `Are you sure you want to unsuspend ${selectedAdmin.username}? They will regain full admin access.`
                  : `Are you sure you want to suspend ${selectedAdmin.username}? They will lose access to the admin panel.`
                }
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSuspendConfirm(false);
                    setSelectedAdmin(null);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-700 text-white hover:bg-slate-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleSuspend}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedAdmin.suspended
                      ? (theme === 'dark' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600')
                      : (theme === 'dark' ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-yellow-500 text-white hover:bg-yellow-600')
                  }`}
                >
                  {selectedAdmin.suspended ? 'Unsuspend' : 'Suspend'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Activity Logs Modal */}
      <AnimatePresence>
        {showLogsModal && selectedAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-2xl max-h-[80vh] rounded-2xl border overflow-hidden flex flex-col ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
            >
              <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
                <div>
                  <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Activity Logs
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                    {selectedAdmin.username} - {logs.length} activities
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowLogsModal(false);
                    setSelectedAdmin(null);
                    setLogs([]);
                  }}
                  className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {logs.length === 0 ? (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                    <ChartLineUp size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No activity logs found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            log.type === 'login' ? (theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100')
                            : log.type === 'logout' ? (theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100')
                            : log.type === 'action' ? (theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100')
                            : (theme === 'dark' ? 'bg-slate-600' : 'bg-gray-200')
                          }`}>
                            {log.type === 'login' ? <CheckCircle size={16} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                            : log.type === 'logout' ? <SignOut size={16} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                            : log.type === 'action' ? <Shield size={16} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
                            : <ChartLineUp size={16} className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'} />
                            }
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {log.action}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                              {log.description}
                            </p>
                            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                              <Clock size={12} className="inline mr-1" />
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminManagement;

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService } from '../../services/chatService';
import { toast } from 'sonner';
import { MagnifyingGlass, UserPlus, X, Users, Sparkle } from '@phosphor-icons/react';
import Modal from '../ui/Modal';
import { useTheme } from '../../contexts/ThemeContext';

const AddMembersModal = ({ isOpen, onClose, chatId, onMembersAdded }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUserSearch = async () => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const data = await chatService.searchUsers(searchQuery);
      const users = data.users || [];
      // Filter out already selected users
      setSearchResults(users.filter(u => !selectedUsers.find(s => s.id === u.id)));
    } catch (error) {
      toast.error('Failed to search users');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleUserSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddUser = (user) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setLoading(true);
    try {
      await chatService.addMembers(chatId, selectedUsers.map(u => u.id));
      toast.success('Members added successfully');
      onMembersAdded?.();
      onClose();
      setSelectedUsers([]);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center ${theme === 'dark' ? 'bg-gradient-to-br from-green-500/20 to-teal-500/20' : 'bg-gradient-to-br from-green-100 to-teal-100'}`}>
            <Users size={32} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
          </div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Add Members</h2>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} mt-1`}>Search and add members to this chat</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlass className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 outline-none transition-all text-sm ${
              theme === 'dark' 
                ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
            }`}
            autoFocus
          />
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkle size={16} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                <p className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                  Search Results
                </p>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                {searchResults.map((user, index) => (
                  <motion.button
                    key={user.id}
                    type="button"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleAddUser(user)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group ${
                      theme === 'dark' 
                        ? 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-green-500/30' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">{user.username?.[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.username}</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'} truncate`}>{user.email}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 ${
                      theme === 'dark' ? 'bg-green-500/20 hover:bg-green-500/30' : 'bg-green-100 hover:bg-green-200'
                    }`}>
                      <UserPlus size={20} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Members */}
        <AnimatePresence>
          {selectedUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                <p className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                  Selected Members ({selectedUsers.length})
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                      theme === 'dark' 
                        ? 'bg-green-500/20 border-green-500/30' 
                        : 'bg-green-100 border-green-300'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{user.username?.[0]?.toUpperCase()}</span>
                    </div>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.username}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => handleRemoveUser(user.id)}
                      className={`p-0.5 rounded-lg transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-red-400' : 'text-gray-600 hover:text-red-400'}`}
                    >
                      <X size={14} />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onClose}
            className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
              theme === 'dark' 
                ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleSubmit}
            disabled={loading || selectedUsers.length === 0}
            className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
              loading || selectedUsers.length === 0
                ? theme === 'dark' ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : theme === 'dark' 
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg' 
                  : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </span>
            ) : (
              `Add Members (${selectedUsers.length})`
            )}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default AddMembersModal;

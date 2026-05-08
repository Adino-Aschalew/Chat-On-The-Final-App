import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { chatService } from '../../services/chatService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MagnifyingGlass, ChatCircle } from '@phosphor-icons/react';

const UserSearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const data = await chatService.searchUsers(searchQuery);
      setUsers(data.users || []);
    } catch (error) {
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (userId) => {
    try {
      const chat = await chatService.createChat({
        type: 'PRIVATE',
        memberIds: [userId],
      });
      navigate(`/chat/${chat.id}`);
      onClose();
    } catch (error) {
      toast.error('Failed to start chat');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Search Users" size="md">
      <div className="space-y-4">
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by username or email..."
            className="pl-10"
          />
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center text-slate-400 py-8">Searching...</div>
          ) : users.length === 0 ? (
            searchQuery.length >= 2 ? (
              <div className="text-center text-slate-400 py-8">No users found</div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                Type at least 2 characters to search
              </div>
            )
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <div className="relative">
                  <Avatar src={user.avatar} alt={user.username} size="md" />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${
                    user.isOnline ? 'bg-green-500' : 'bg-slate-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{user.username}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleStartChat(user.id)}
                >
                  <ChatCircle size={16} className="mr-1" />
                  Message
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UserSearchModal;

import { useState } from 'react';
import { Users, Hash, Info } from '@phosphor-icons/react';
import { chatService } from '../../services/chatService';
import { toast } from 'sonner';

import Modal from '../ui/Modal';

const CreateChatModal = ({ isOpen, onClose, onChatCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'GROUP',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleTypeChange = (type) => {
    setFormData({ ...formData, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Chat name is required');
      return;
    }
    setLoading(true);

    try {
      const payload = {
        type: formData.type,
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      const newChat = await chatService.createChat(payload);
      toast.success('Chat created successfully');
      onChatCreated(newChat);
      onClose();
      setFormData({ name: '', type: 'GROUP', description: '' });
    } catch (error) {
      console.error('Create chat error:', error);
      toast.error(error.response?.data?.message || 'Failed to create chat');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Chat" size="sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Chat Type Selection */}
        <div>
          <label className="block text-xs font-medium text-[#8e9ba8] uppercase tracking-wider mb-3">
            Chat Type
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('GROUP')}
              className={`flex-1 flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                formData.type === 'GROUP'
                  ? 'border-[#3390ec] bg-[#3390ec]/10 text-white'
                  : 'dark:border-[#242f3d] dark:bg-[#242f3d]/50 text-[#8e9ba8] hover:border-[#3390ec]/50 hover:text-white'
              }`}
            >
              <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center ${
                formData.type === 'GROUP' ? 'bg-[#3390ec]' : 'bg-[#242f3d]'
              }`}>
                <Users size={13} className="sm:size-9 text-white" weight="fill" />
              </div>
              <div className="text-left">
                <div className="font-medium text-black text-sm dark:text-white">Group</div>
                <div className="text-xs text-[#8e9ba8] hidden sm:block">Chat with multiple people</div>
                <div className="text-xs text-[#8e9ba8] sm:hidden">Multiple people</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('CHANNEL')}
              className={`flex-1 flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                formData.type === 'CHANNEL'
                  ? 'border-[#3390ec] bg-[#3390ec]/10 text-white'
                  : 'dark:border-[#242f3d] border-[#242f3d] dark:bg-[#242f3d]/50 text-[#8e9ba8] hover:border-[#3390ec]/50 hover:text-white'
              }`}
            >
              <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center ${
                formData.type === 'CHANNEL' ? 'bg-[#3390ec]' : 'bg-[#242f3d]'
              }`}>
                <Hash size={13} className="sm:size-9 text-white" weight="fill" />
              </div>
              <div className="text-left">
                <div className="font-medium text-black text-sm dark:text-white">Channel</div>
                <div className="text-xs text-black dark:text-[#8e9ba8] hidden sm:block">Broadcast messages</div>
                <div className="text-xs text-black dark:text-[#8e9ba8] sm:hidden">Broadcast</div>
              </div>
            </button>
          </div>
        </div>

        {/* Chat Name */}
        <div>
          <label className="block text-xs font-medium text-[#8e9ba8] uppercase tracking-wider mb-2">
            Chat Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter chat name"
            className="w-full px-4 py-3 dark:bg-[#242f3d] border border-[#242f3d] rounded-xl dark:text-white placeholder-[#6b7c8e] focus:outline-none focus:border-[#3390ec] focus:ring-1 focus:ring-[#3390ec] transition-all"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-[#8e9ba8] uppercase tracking-wider mb-2">
            Description <span className="normal-case text-[#6b7c8e]">(Optional)</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter a description"
            rows={3}
            className="w-full px-4 py-3 dark:bg-[#242f3d] border border-[#242f3d] rounded-xl dark:text-white placeholder-[#6b7c8e] focus:outline-none focus:border-[#3390ec] focus:ring-1 focus:ring-[#3390ec] transition-all resize-none"
          />
        </div>

        {/* Add Members Info */}
        <div className="dark:bg-[#242f3d]/50 border border-[#242f3d] rounded-xl p-4 flex gap-3">
          <Info size={20} className="dark:text-[#3390ec] flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium dark:text-white mb-1">Add Members</div>
            <p className="text-xs dark:text-[#8e9ba8] leading-relaxed">
              Member selection is not available in the backend yet. You can add members after creating the {formData.type.toLowerCase()}.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl text-[#8e9ba8] hover:text-white hover:bg-[#242f3d] transition-all font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.name.trim()}
            className="flex-1 px-4 py-3 rounded-xl bg-[#3390ec] hover:bg-[#2a7bc9] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </span>
            ) : (
              'Create Chat'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateChatModal;

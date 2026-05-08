import api from './api';

export const chatService = {
  getChats: async () => {
    const response = await api.get('/chats');
    return response.data.data;
  },

  getChatById: async (id) => {
    const response = await api.get(`/chats/${id}`);
    return response.data.data;
  },

  createChat: async (chatData) => {
    const response = await api.post('/chats', chatData);
    return response.data.data;
  },

  updateChat: async (id, chatData) => {
    const response = await api.put(`/chats/${id}`, chatData);
    return response.data.data;
  },

  deleteChat: async (id) => {
    const response = await api.delete(`/chats/${id}`);
    return response.data;
  },

  addMembers: async (chatId, memberIds) => {
    const response = await api.post(`/chats/${chatId}/members`, { memberIds });
    return response.data;
  },

  removeMember: async (chatId, memberId) => {
    const response = await api.delete(`/chats/${chatId}/members/${memberId}`);
    return response.data;
  },

  pinChat: async (chatId) => {
    const response = await api.put(`/chats/${chatId}/pin`);
    return response.data;
  },

  unpinChat: async (chatId) => {
    const response = await api.put(`/chats/${chatId}/unpin`);
    return response.data;
  },

  archiveChat: async (chatId) => {
    const response = await api.put(`/chats/${chatId}/archive`);
    return response.data;
  },

  unarchiveChat: async (chatId) => {
    const response = await api.put(`/chats/${chatId}/unarchive`);
    return response.data;
  },

  updateStatus: async (status) => {
    const response = await api.put('/users/status', { status });
    return response.data;
  },

  getMessages: async (chatId, page = 1, limit = 50) => {
    const response = await api.get(`/messages/chat/${chatId}?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data.data;
  },

  editMessage: async (id, content) => {
    const response = await api.put(`/messages/${id}`, { content });
    return response.data;
  },

  deleteMessage: async (id) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },

  clearMessages: async (chatId) => {
    const response = await api.delete(`/messages/chat/${chatId}/clear`);
    return response.data;
  },

  searchMessages: async (query) => {
    const response = await api.get(`/search/messages?q=${query}`);
    return response.data;
  },

  searchUsers: async (query) => {
    try {
      // Client-side filtering since backend doesn't have a search endpoint
      const { usersService } = await import('./usersService');
      const response = await usersService.getAllUsers();
      const allUsers = response.users || response.data || response;
      const filtered = allUsers.filter(user => 
        user.username?.toLowerCase().startsWith(query.toLowerCase())
      );
      return { users: filtered };
    } catch (error) {
      console.error('searchUsers error:', error);
      throw error;
    }
  },
  
  pinMessage: async (chatId, messageId) => {
    const response = await api.post(`/chats/${chatId}/pin/${messageId}`);
    return response.data.data;
  },

  unpinMessage: async (chatId) => {
    const response = await api.post(`/chats/${chatId}/unpin`);
    return response.data.data;
  },

  getLinkPreview: async (url) => {
    const response = await api.get(`/links/preview?url=${encodeURIComponent(url)}`);
    return response.data.data;
  },

  getReadReceipts: async (messageId) => {
    const response = await api.get(`/messages/${messageId}/read-receipts`);
    return response.data.data;
  },

  translateMessage: async (messageId, targetLang) => {
    const response = await api.post(`/messages/${messageId}/translate`, { targetLang });
    return response.data.data;
  },

  scheduleMessage: async (chatId, messageData) => {
    const response = await api.post(`/scheduled-messages/${chatId}`, messageData);
    return response.data.data;
  },

  getScheduledMessages: async (chatId = null) => {
    const url = chatId ? `/scheduled-messages?chatId=${chatId}` : '/scheduled-messages';
    const response = await api.get(url);
    return response.data.data;
  },

  cancelScheduledMessage: async (id) => {
    const response = await api.delete(`/scheduled-messages/${id}`);
    return response.data;
  },
};

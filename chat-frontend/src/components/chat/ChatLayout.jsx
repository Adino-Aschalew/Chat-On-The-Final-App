import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { chatService } from '../../services/chatService';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import { useSocket } from '../../contexts/SocketContext';

const ChatLayout = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const { theme } = useTheme();
  const { socket } = useSocket();

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('chats_updated', () => {
      loadChats();
    });

    socket.on('receive_message', (newMessage) => {
      // If we're not currently looking at this chat, refresh the list to show unread count/last message
      if (activeChat?.id !== newMessage.chatId) {
        loadChats();
      }
    });

    return () => {
      socket.off('chats_updated');
      socket.off('receive_message');
    };
  }, [socket, activeChat]);

  const loadChats = async () => {
    try {
      const data = await chatService.getChats();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Error loading chats:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load chats';
      toast.error(errorMessage);
    }
  };

  const handleChatUpdate = () => {
    loadChats();
  };

  const handleChatDeleted = () => {
    setActiveChat(null);
    loadChats();
  };

  const handleChatUpdated = async () => {
    await loadChats();
    // Also reload the active chat to get updated member data
    if (activeChat) {
      try {
        const updatedChat = await chatService.getChatById(activeChat.id);
        setActiveChat(updatedChat);
      } catch (error) {
        console.error('Failed to reload active chat:', error);
      }
    }
  };

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className="flex w-full">
        <Sidebar
          chats={chats}
          activeChat={activeChat}
          onChatSelect={setActiveChat}
          onChatUpdate={handleChatUpdate}
        />
        <div className="flex-1">
          <ChatWindow 
            chat={activeChat} 
            onBack={() => setActiveChat(null)} 
            onChatDeleted={handleChatDeleted}
            onChatUpdated={handleChatUpdated}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;

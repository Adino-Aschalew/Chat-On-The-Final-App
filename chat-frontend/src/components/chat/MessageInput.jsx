import { useState, useRef, useEffect } from 'react';
import { Paperclip, Smiley, PaperPlaneRight, X, PencilSimple, FilePdf, FileText, FileDoc, File, ArrowBendUpRight, Clock } from '@phosphor-icons/react';
import Button from '../ui/Button';
import EmojiPicker from '../ui/EmojiPicker';
import ScheduleModal from './ScheduleModal';
import { fileService } from '../../services/fileService';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';

const MessageInput = ({ onSendMessage, onTypingStart, onTypingStop, editingMessage, onCancelEdit, replyingTo, onCancelReply }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { theme } = useTheme();

  const handleScheduleMessage = (scheduleData) => {
    const messageType = file 
      ? (file.mimetype?.startsWith('image/') ? 'IMAGE' : 'FILE') 
      : 'TEXT';

    onSendMessage({
      content: message,
      messageType,
      fileUrl: file?.url,
      fileName: file?.name,
      fileSize: file?.size,
      isScheduled: true,
      ...scheduleData
    });

    setMessage('');
    setFile(null);
    onTypingStop?.();
  };

  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content);
    } else {
      setMessage('');
    }
  }, [editingMessage]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    onTypingStart?.();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop?.();
    }, 1000);
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setUploading(true);
    try {
      const uploadedFile = await fileService.uploadFile(selectedFile);
      setFile(uploadedFile);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleSend = () => {
    if (!message.trim() && !file) return;

    const messageType = file 
      ? (file.mimetype?.startsWith('image/') ? 'IMAGE' : 'FILE') 
      : 'TEXT';

    onSendMessage({
      content: message,
      messageType,
      fileUrl: file?.url,
      fileName: file?.name,
      fileSize: file?.size,
    });

    setMessage('');
    setFile(null);
    onTypingStop?.();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t bg-tg-bg border-tg-border">
      {editingMessage && (
        <div className="mb-2 flex items-center justify-between p-2 rounded-lg border-l-2 border-tg-primary bg-tg-chat">
          <div className="flex items-center gap-2 text-tg-primary">
            <PencilSimple size={16} />
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase">Editing Message</span>
              <span className="text-sm truncate max-w-[200px] text-tg-secondary">{editingMessage.content}</span>
            </div>
          </div>
          <button onClick={onCancelEdit} className="p-1 rounded-full transition-colors text-tg-secondary hover:text-tg-text hover:bg-tg-bg">
            <X size={18} />
          </button>
        </div>
      )}
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between p-2 rounded-lg border-l-2 border-tg-primary bg-tg-chat">
          <div className="flex items-center gap-2 text-tg-primary">
            <ArrowBendUpRight size={16} weight="bold" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase">Replying to {replyingTo.sender?.username}</span>
              <span className="text-sm truncate max-w-[200px] text-tg-secondary">{replyingTo.content}</span>
            </div>
          </div>
          <button onClick={onCancelReply} className="p-1 rounded-full transition-colors text-tg-secondary hover:text-tg-text hover:bg-tg-bg">
            <X size={18} />
          </button>
        </div>
      )}
      {file && (
        <div className="mb-4 relative inline-block group">
          {(() => {
            const isImage = file.mimetype?.startsWith('image/') || 
                           /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.url);
            
            if (isImage) {
              return (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-amber-500 shadow-lg">
                  <img src={file.url} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">Preview</span>
                  </div>
                </div>
              );
            } else {
              return (
                <div className={`flex items-center gap-2 p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-200 border-gray-300'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-inner ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-300'}`}>
                    {(() => {
                      const ext = file.name?.split('.').pop().toLowerCase();
                      if (ext === 'pdf') return <FilePdf size={24} className="text-red-400" />;
                      if (['doc', 'docx'].includes(ext)) return <FileDoc size={24} className="text-blue-400" />;
                      if (ext === 'txt') return <FileText size={24} className="text-slate-400" />;
                      return <File size={24} className="text-amber-500" />;
                    })()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-sm font-medium truncate max-w-[150px] ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{file.name}</span>
                    <span className={`text-[10px] font-mono italic ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
              );
            }
          })()}
          <button
            onClick={() => setFile(null)}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 rounded-lg transition-colors disabled:opacity-50 text-tg-secondary hover:text-tg-primary hover:bg-tg-chat"
        >
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          value={message}
          onChange={handleTyping}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-lg outline-none bg-tg-chat text-tg-text placeholder-tg-secondary border border-transparent focus:border-tg-primary transition-all"
          disabled={uploading}
        />
        <EmojiPicker
          onEmojiSelect={(emoji) => setMessage((prev) => prev + emoji)}
        />
        <button
          onClick={() => setShowSchedule(true)}
          disabled={!message.trim() && !file || uploading}
          className="p-2 rounded-lg transition-colors disabled:opacity-50 text-tg-secondary hover:text-tg-primary hover:bg-tg-chat"
          title="Schedule message"
        >
          <Clock size={20} />
        </button>
        <button 
          onClick={handleSend} 
          disabled={!message.trim() && !file || uploading}
          className="p-2 text-tg-primary hover:text-tg-primary/80 disabled:opacity-50 transition-colors"
        >
          <PaperPlaneRight size={24} weight="fill" />
        </button>
      </div>
      <ScheduleModal 
        isOpen={showSchedule}
        onClose={() => setShowSchedule(false)}
        onSchedule={handleScheduleMessage}
        initialContent={message}
      />
    </div>
  );
};

export default MessageInput;

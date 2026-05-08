import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import Avatar from '../ui/Avatar';
import Dropdown from '../ui/Dropdown';
import { Check, Checks, ArrowBendUpRight, DotsThree, Copy, PencilSimple, Trash, FilePdf, FileText, FileDoc, File, Paperclip, PushPin, Translate } from '@phosphor-icons/react';
import MessageReactions from './MessageReactions';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import LinkPreview from './LinkPreview';
import { chatService } from '../../services/chatService';

const MessageBubble = ({ message, isOwn, onReply, onReact, onDelete, onEdit, onOpenThread, searchQuery, isActiveSearch, onPin, onForward, onShowReadReceipts }) => {
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const [translatedText, setTranslatedText] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('Message copied');
  };

  const handleTranslate = async (targetLang = 'en') => {
    setIsTranslating(true);
    try {
      const data = await chatService.translateMessage(message.id, targetLang);
      setTranslatedText(data.translatedText);
      toast.success('Translated successfully');
    } catch (error) {
      toast.error('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className={`${isActiveSearch ? 'bg-green-400 text-slate-900' : 'bg-tg-primary text-white'} rounded-sm px-0.5`}>
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isActiveSearch ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`flex w-full mb-4 gap-3 ${isOwn ? 'flex-row-reverse justify-start' : 'justify-start'} ${isActiveSearch ? 'z-10 relative' : ''}`}
    >
      <div className="relative z-10">
        <Avatar src={message.sender?.avatar} alt={message.sender?.username} size="sm" />
      </div>
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col transition-all duration-300 ${isActiveSearch ? 'drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]' : ''}`}>
        <span className={`text-xs mb-1 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
          {isOwn ? 'You' : message.sender?.username}
        </span>
        <Dropdown
          trigger={
            <div
              className={`px-4 py-2 rounded-[16px] cursor-pointer hover:brightness-[1.02] transition-all tg-shadow ${
                isOwn
                  ? 'bg-tg-outgoing text-tg-text rounded-br-[4px]'
                  : 'bg-tg-incoming text-tg-text rounded-bl-[4px]'
              }`}
            >
              {message.isForwarded && (
                <div className="flex items-center gap-1 mb-1 opacity-60 text-[10px] italic">
                  <ArrowBendUpRight size={12} />
                  <span>Forwarded</span>
                </div>
              )}
              {message.replyTo && (
                <div className={`mb-2 p-2 rounded-lg border-l-4 text-xs ${theme === 'dark' ? 'bg-slate-900/50 border-tg-primary' : 'bg-black/5 border-tg-primary'}`}>
                  <p className="font-bold text-tg-primary mb-1">{message.replyTo.sender?.username}</p>
                  <p className="truncate opacity-80">{message.replyTo.content || (message.replyTo.fileUrl ? 'Attachment' : '')}</p>
                </div>
              )}
              {message.fileUrl && (() => {
                const type = message.messageType || message.message_type;
                const isImage = type === 'IMAGE' || 
                               /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(message.fileUrl) ||
                               message.fileType?.startsWith('image/');
                
                if (isImage) {
                  return (
                    <div className="mt-2">
                      <img 
                        src={message.fileUrl.startsWith('http') ? message.fileUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:3000'}${message.fileUrl}`}
                        alt="attachment" 
                        className={`max-w-[200px] max-h-[300px] object-cover cursor-pointer transition-all ${
                          isOwn 
                            ? 'rounded-2xl rounded-br-sm shadow-lg hover:shadow-xl hover:scale-[1.02]' 
                            : 'rounded-2xl rounded-bl-sm shadow-lg hover:shadow-xl hover:scale-[1.02]'
                        }`}
                        onClick={() => window.open(message.fileUrl.startsWith('http') ? message.fileUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:3000'}${message.fileUrl}`, '_blank')}
                      />
                    </div>
                  );
                } else {
                  const getFileIcon = (url) => {
                    const ext = url?.split('.').pop().toLowerCase();
                    if (ext === 'pdf') return <FilePdf size={24} className="text-red-400" />;
                    if (['doc', 'docx'].includes(ext)) return <FileDoc size={24} className="text-blue-400" />;
                    if (ext === 'txt') return <FileText size={24} className="text-slate-400" />;
                    return <File size={24} className="text-tg-primary" />;
                  };

                  return (
                    <div className="mt-2">
                      <a
                        href={message.fileUrl.startsWith('http') ? message.fileUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:3000'}${message.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors group ${theme === 'dark' ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700' : 'bg-black/5 border-black/10 hover:bg-black/10'}`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all shadow-inner ${theme === 'dark' ? 'bg-slate-800 group-hover:bg-slate-700' : 'bg-white/50 group-hover:bg-white/80'}`}>
                          {getFileIcon(message.fileUrl)}
                        </div>
                        <div className={`flex flex-col min-w-0 text-left ${theme === 'dark' ? 'text-white' : 'text-tg-text'}`}>
                          <span className="text-sm font-medium truncate max-w-[150px]">{message.fileName || 'Download File'}</span>
                          <span className={`text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-tg-secondary'}`}>Click to view</span>
                        </div>
                      </a>
                    </div>
                  );
                }
              })()}
              {message.content && (
                <div className="flex flex-col">
                  <p className="mt-2 max-w-[20rem] whitespace-normal break-words">
                    {highlightText(message.content, searchQuery)}
                  </p>
                  {translatedText && (
                    <div className={`mt-2 p-2 rounded-lg border-l-2 text-sm italic ${theme === 'dark' ? 'border-tg-primary bg-slate-700/50' : 'border-tg-primary bg-black/5'}`}>
                      <p className="text-[10px] font-bold uppercase mb-1 flex items-center gap-1 text-tg-primary">
                        <Translate size={10} /> Translated
                      </p>
                      <p className="text-tg-text">{translatedText}</p>
                    </div>
                  )}
                  {(() => {
                    const urlMatch = message.content.match(/https?:\/\/[^\s]+/);
                    return urlMatch ? <LinkPreview url={urlMatch[0]} /> : null;
                  })()}
                </div>
              )}
            </div>
          }
        >
          <div className="py-1 w-32">
            <button
              onClick={handleCopy}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Copy size={16} /> Copy
            </button>
            <button
              onClick={() => onReply?.(message)}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <ArrowBendUpRight size={16} /> Reply
            </button>
            <button
              onClick={() => onForward?.(message)}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <ArrowBendUpRight size={16} weight="fill" className="rotate-90" /> Forward
            </button>
            <button
              onClick={() => handleTranslate(currentUser?.preferredLanguage || 'en')}
              disabled={isTranslating}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'} disabled:opacity-50`}
            >
              <Translate size={16} /> {isTranslating ? 'Translating...' : 'Translate'}
            </button>
            <button
              onClick={() => onPin?.(message.id)}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <PushPin size={16} /> Pin
            </button>
            {isOwn && (
              <>
                <button
                  onClick={() => onEdit?.(message)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <PencilSimple size={16} /> Edit
                </button>
                <button
                  onClick={() => onDelete?.(message.id)}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <Trash size={16} /> Delete
                </button>
              </>
            )}
          </div>
        </Dropdown>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <MessageReactions
            reactions={message.reactions}
            onAddReaction={onReact}
            onRemoveReaction={onReact}
          />
        )}

        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
            {message.createdAt && !isNaN(new Date(message.createdAt).getTime())
              ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })
              : 'Just now'}
          </span>
          {isOwn && (
            <div 
              className="ml-1 cursor-pointer hover:scale-110 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                onShowReadReceipts?.(message.id);
              }}
              title="View read receipts"
            >
              {message.isRead ? (
                <Checks size={16} className="text-blue-400" weight="bold" />
              ) : message.isDelivered ? (
                <Checks size={16} className="text-slate-400" />
              ) : (
                <Check size={16} className="text-slate-400" />
              )}
            </div>
          )}
          {message.threadId && (
            <button
              onClick={() => onOpenThread?.(message.threadId)}
              className="text-slate-500 hover:text-tg-primary transition-colors"
            >
              <ArrowBendUpRight size={14} />
            </button>
          )}
          <button
            onClick={() => {/* Show message options */}}
            className={`text-slate-500 hover:text-white transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`}
          >
            <DotsThree size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;

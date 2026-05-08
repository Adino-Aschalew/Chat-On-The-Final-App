import { useState, useEffect } from 'react';
import { chatService } from '../../services/chatService';
import { useTheme } from '../../contexts/ThemeContext';
import { Link as LinkIcon } from '@phosphor-icons/react';

const LinkPreview = ({ url }) => {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await chatService.getLinkPreview(url);
        setMetadata(data);
      } catch (error) {
        console.error('Failed to fetch link preview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [url]);

  if (loading) {
    return (
      <div className={`mt-2 p-3 rounded-xl border animate-pulse ${theme === 'dark' ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-100 border-gray-200'}`}>
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded bg-slate-600/50"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-600/50 rounded w-3/4"></div>
            <div className="h-2 bg-slate-600/50 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!metadata || (!metadata.title && !metadata.description)) {
    return null;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`mt-2 block rounded-xl border overflow-hidden transition-all hover:scale-[1.01] ${theme === 'dark' ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}`}
    >
      {metadata.image && (
        <div className="h-32 w-full overflow-hidden">
          <img src={metadata.image} alt="preview" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <LinkIcon size={14} className="text-amber-500" />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
            {metadata.siteName || new URL(url).hostname}
          </span>
        </div>
        <h4 className={`text-sm font-bold line-clamp-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {metadata.title}
        </h4>
        {metadata.description && (
          <p className={`text-xs mt-1 line-clamp-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            {metadata.description}
          </p>
        )}
      </div>
    </a>
  );
};

export default LinkPreview;

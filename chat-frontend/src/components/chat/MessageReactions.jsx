import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Smiley } from '@phosphor-icons/react';

const MessageReactions = ({ reactions, onAddReaction, onRemoveReaction }) => {
  const [showPicker, setShowPicker] = useState(false);

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

  const groupedReactions = reactions?.reduce((acc, reaction) => {
    const emoji = reaction.emoji;
    if (!acc[emoji]) {
      acc[emoji] = { count: 0, users: [] };
    }
    acc[emoji].count += 1;
    acc[emoji].users.push(reaction.userId);
    return acc;
  }, {}) || {};

  return (
    <div className="relative">
      <div className="flex gap-1 flex-wrap">
        {Object.entries(groupedReactions).map(([emoji, data]) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onRemoveReaction?.(emoji)}
            className="px-2 py-1 bg-slate-700 rounded-full text-sm hover:bg-slate-600 transition-colors"
          >
            {emoji} <span className="text-xs text-slate-400">{data.count}</span>
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPicker(!showPicker)}
          className="px-2 py-1 bg-slate-700 rounded-full text-sm hover:bg-slate-600 transition-colors"
        >
          <Smiley size={16} />
        </motion.button>
      </div>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-2 left-0 bg-slate-800 rounded-lg p-2 shadow-xl border border-slate-700 z-50"
          >
            <div className="flex gap-1 flex-wrap">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onAddReaction?.(emoji);
                    setShowPicker(false);
                  }}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-2xl"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageReactions;

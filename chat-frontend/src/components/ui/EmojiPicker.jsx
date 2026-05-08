import { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Smiley } from '@phosphor-icons/react';
import { toast } from 'sonner';

const EmojiPickerWrapper = ({ onEmojiSelect }) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Smiley size={20} />
      </button>
      {showPicker && (
        <div className="absolute bottom-full right-0 mb-2 z-50">
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              onEmojiSelect(emojiData.emoji);
              setShowPicker(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPickerWrapper;

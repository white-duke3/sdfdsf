import React, { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';

const EMOJI_CATEGORIES = [
  {
    name: 'Смайлы',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮', '🤐', '😴', '😷', '🤒', '🤕', '🤢'],
  },
  {
    name: 'Жесты',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  },
  {
    name: 'Сердца',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'],
  },
  {
    name: 'Объекты',
    emojis: ['🔥', '⭐', '🌟', '✨', '💫', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🎯', '💡', '📱', '💻', '⌨️', '🖥️', '📷', '🎵', '🎶', '🎸', '🎮', '🚀', '✈️', '🌍', '☀️', '🌙', '⚡', '💧', '🌈'],
  },
];

interface Props {
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-full transition-all-fast hover:opacity-70"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <Smile className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full mb-2 left-0 rounded-xl shadow-xl overflow-hidden animate-fade-in z-50"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            width: '320px',
          }}
        >
          {/* Category tabs */}
          <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
            {EMOJI_CATEGORIES.map((cat, idx) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(idx)}
                className="flex-1 py-2 text-xs font-medium transition-all-fast"
                style={{
                  color: activeCategory === idx ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  borderBottom: activeCategory === idx ? '2px solid var(--color-primary)' : '2px solid transparent',
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div className="p-2 grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto">
            {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelect(emoji);
                  setIsOpen(false);
                }}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-xl hover:scale-110 transition-transform"
                style={{ backgroundColor: 'transparent' }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

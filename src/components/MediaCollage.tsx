import React from 'react';
import { Attachment } from '../types';

interface Props {
  attachments: Attachment[];
  isOwn: boolean;
  onImageClick?: (src: string, alt: string) => void;
}

export default function MediaCollage({ attachments, isOwn, onImageClick }: Props) {
  const count = attachments.length;

  // Если только один файл, показываем его как обычно
  if (count === 1) {
    const attachment = attachments[0];
    if (attachment.mimeType.startsWith('image/')) {
      return (
        <div className="mb-1 -mx-1 overflow-hidden rounded-xl">
          <img
            src={attachment.url}
            alt={attachment.originalName}
            className="max-w-[280px] max-h-[280px] object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => onImageClick?.(attachment.url, attachment.originalName)}
            loading="lazy"
          />
        </div>
      );
    }
    return null;
  }

  // Определяем layout в зависимости от количества
  const getLayout = () => {
    if (count === 2) {
      return 'grid-cols-2 grid-rows-1';
    }
    if (count === 3) {
      return 'grid-cols-2 grid-rows-2';
    }
    if (count === 4) {
      return 'grid-cols-2 grid-rows-2';
    }
    // 5-9: первый большой, остальные маленькие
    return 'grid-cols-3 grid-rows-3';
  };

  const getItemStyle = (index: number) => {
    if (count === 2) {
      return 'col-span-1 row-span-1';
    }
    if (count === 3) {
      if (index === 0) return 'col-span-2 row-span-2';
      return 'col-span-1 row-span-1';
    }
    if (count === 4) {
      return 'col-span-1 row-span-1';
    }
    // 5-9
    if (index === 0) return 'col-span-2 row-span-2';
    return 'col-span-1 row-span-1';
  };

  return (
    <div className={`grid ${getLayout()} gap-1 mb-1 -mx-1 rounded-xl overflow-hidden`} style={{ maxWidth: '320px' }}>
      {attachments.map((attachment, index) => (
        <div
          key={attachment.id}
          className={`relative ${getItemStyle(index)} overflow-hidden cursor-pointer hover:opacity-90 transition-opacity`}
          onClick={() => {
            if (attachment.mimeType.startsWith('image/')) {
              onImageClick?.(attachment.url, attachment.originalName);
            }
          }}
        >
          {attachment.mimeType.startsWith('image/') && (
            <img
              src={attachment.url}
              alt={attachment.originalName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
          {attachment.mimeType.startsWith('video/') && (
            <div className="relative w-full h-full bg-black">
              <video
                src={attachment.url}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90">
                  <svg className="w-5 h-5 ml-0.5" fill="var(--color-primary)" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
          {/* Показываем "+N" если больше 9 файлов */}
          {index === 8 && count > 9 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="text-white text-2xl font-bold">+{count - 9}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

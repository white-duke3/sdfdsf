import React from 'react';
import { Message } from '../types';
import { format } from 'date-fns';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import Avatar from './Avatar';
import { getUserById } from '../store';

interface Props {
  message: Message;
  isOwn: boolean;
  onContextMenu: (e: React.MouseEvent, message: Message) => void;
  onReply: (message: Message) => void;
  onImageClick?: (src: string, alt: string) => void;
  allMessages: Message[];
}

export default function MessageBubble({ message, isOwn, onContextMenu, onReply, onImageClick, allMessages }: Props) {
  const sender = getUserById(message.senderId);
  const replyMessage = message.replyToId ? allMessages.find(m => m.id === message.replyToId) : null;
  const replySender = replyMessage ? getUserById(replyMessage.senderId) : null;

  const isDeleted = !!message.deletedAt;
  const isEdited = !!message.updatedAt;

  const renderStatus = () => {
    if (!isOwn) return null;
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3.5 h-3.5 opacity-60" />;
      case 'sent':
        return <Check className="w-3.5 h-3.5 opacity-60" />;
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 opacity-60" />;
      case 'read':
        return <CheckCheck className="w-3.5 h-3.5" style={{ color: isOwn ? 'rgba(255,255,255,0.9)' : 'var(--color-primary)' }} />;
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5" style={{ color: 'var(--color-danger)' }} />;
      default:
        return null;
    }
  };

  const time = format(new Date(message.createdAt), 'HH:mm');

  if (isDeleted) {
    return (
      <div className="flex mb-2 animate-fade-in">
        <div className={`max-w-[75%] px-4 py-2 ${isOwn ? 'ml-auto' : ''}`}
          style={{
            backgroundColor: isOwn ? 'var(--color-msg-out)' : 'var(--color-msg-in)',
            borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            opacity: 0.6,
          }}
        >
          <p className="text-xs italic" style={{ color: isOwn ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }}>
            Сообщение удалено
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex mb-2 animate-fade-in ${isOwn ? 'justify-end' : 'justify-start'}`}
      onContextMenu={e => onContextMenu(e, message)}
    >
      <div className={`flex gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
        {!isOwn && sender && (
          <div className="flex-shrink-0 self-end">
            <Avatar user={sender} size={28} />
          </div>
        )}
        <div>
          {/* Reply preview */}
          {replyMessage && (
            <div
              className="mb-1 px-3 py-1.5 rounded-lg cursor-pointer text-xs border-l-2"
              style={{
                backgroundColor: isOwn ? 'rgba(255,255,255,0.15)' : 'var(--color-bg-tertiary)',
                borderLeftColor: 'var(--color-primary)',
              }}
              onClick={() => {
                const el = document.getElementById(`msg-${replyMessage.id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              <p className="font-medium" style={{ color: isOwn ? 'rgba(255,255,255,0.8)' : 'var(--color-primary)' }}>
                {replySender?.name || 'Пользователь'}
              </p>
              <p className="truncate" style={{ color: isOwn ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)' }}>
                {replyMessage.text || 'Медиа'}
              </p>
            </div>
          )}

          {/* Message bubble */}
          <div
            id={`msg-${message.id}`}
            className={`px-4 py-2 ${isOwn ? 'msg-bubble-out' : 'msg-bubble-in'} group relative`}
          >
            {message.type === 'image' && message.attachment && (
              <div className="mb-1 -mx-1 overflow-hidden rounded-xl">
                <img
                  src={message.attachment.url}
                  alt={message.attachment.originalName}
                  className="max-w-[280px] max-h-[280px] object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => onImageClick?.(message.attachment!.url, message.attachment!.originalName)}
                  loading="lazy"
                />
              </div>
            )}
            {message.type === 'video' && message.attachment && (
              <div className="mb-1 -mx-1">
                <video
                  src={message.attachment.url}
                  controls
                  className="rounded-xl max-w-[280px] max-h-[280px]"
                />
              </div>
            )}
            {message.type === 'audio' && message.attachment && (
              <div className="flex items-center gap-3 py-1 min-w-[220px]">
                <button className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all-fast hover:opacity-80 hover:scale-105" style={{ backgroundColor: isOwn ? 'rgba(255,255,255,0.2)' : 'var(--color-primary)' }}>
                  <svg className="w-4 h-4 ml-0.5" fill="white" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-0.5 h-8">
                    {Array.from({ length: 30 }).map((_, i) => {
                      // Generate consistent waveform based on message ID
                      const seed = message.id ? message.id.charCodeAt(i % message.id.length) : i;
                      const height = 6 + Math.sin(i * 0.4 + seed * 0.1) * 10 + Math.cos(i * 0.7) * 4;
                      return (
                        <div
                          key={i}
                          className="w-0.5 rounded-full transition-all"
                          style={{
                            height: `${Math.max(4, height)}px`,
                            backgroundColor: isOwn ? 'rgba(255,255,255,0.7)' : 'var(--color-primary)',
                            opacity: 0.6 + Math.sin(i * 0.3) * 0.3,
                          }}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[10px] mt-0.5" style={{ color: isOwn ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }}>
                    {message.attachment.duration ? `${Math.floor(message.attachment.duration / 60)}:${(message.attachment.duration % 60).toString().padStart(2, '0')}` : '0:00'}
                  </span>
                </div>
              </div>
            )}
            {message.type === 'file' && message.attachment && (
              <div className="flex items-center gap-3 py-1">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isOwn ? 'rgba(255,255,255,0.15)' : 'var(--color-bg-tertiary)' }}>
                  <svg className="w-5 h-5" fill="none" stroke={isOwn ? 'white' : 'var(--color-primary)'} viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate" style={{ color: isOwn ? '#fff' : 'var(--color-text)' }}>
                    {message.attachment.originalName}
                  </p>
                  <p className="text-[10px]" style={{ color: isOwn ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)' }}>
                    {message.attachment.size < 1024 * 1024 
                      ? `${(message.attachment.size / 1024).toFixed(1)} KB`
                      : `${(message.attachment.size / (1024 * 1024)).toFixed(1)} MB`
                    }
                  </p>
                </div>
              </div>
            )}
            {message.text && (
              <p className="text-sm whitespace-pre-wrap break-words" style={{ lineHeight: '1.4' }}>
                {message.text}
              </p>
            )}
            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              {isEdited && (
                <span className="text-[10px]" style={{ color: isOwn ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)' }}>
                  изменено
                </span>
              )}
              <span className="text-[10px]" style={{ color: isOwn ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)' }}>
                {time}
              </span>
              {renderStatus()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

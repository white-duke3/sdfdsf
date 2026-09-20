import React from 'react';
import { Message } from '../types';
import { format } from 'date-fns';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import Avatar from './Avatar';
import AudioPlayer from './AudioPlayer';
import VideoPlayer from './VideoPlayer';
import MediaCollage from './MediaCollage';
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
      className={`flex mb-2 animate-message-in ${isOwn ? 'justify-end' : 'justify-start'}`}
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
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Add highlight effect
                  el.classList.add('animate-pulse');
                  setTimeout(() => {
                    el.classList.remove('animate-pulse');
                  }, 2000);
                }
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
            {/* Коллаж из нескольких медиа */}
            {message.attachments && message.attachments.length > 0 && (
              <MediaCollage
                attachments={message.attachments}
                isOwn={isOwn}
                onImageClick={onImageClick}
              />
            )}
            
            {/* Одиночное изображение */}
            {message.type === 'image' && message.attachment && !message.attachments && (
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
            
            {/* Одиночное видео */}
            {message.type === 'video' && message.attachment && !message.attachments && (
              <div className="mb-1 -mx-1">
                <VideoPlayer
                  url={message.attachment.url}
                  isOwn={isOwn}
                />
              </div>
            )}
            {message.type === 'audio' && message.attachment && (
              <AudioPlayer
                url={message.attachment.url}
                duration={message.attachment.duration}
                isOwn={isOwn}
              />
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

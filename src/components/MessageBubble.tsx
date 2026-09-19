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
            className={`px-4 py-2 ${isOwn ? 'msg-bubble-out' : 'msg-bubble-in'}`}
          >
            {message.type === 'image' && message.attachment && (
              <div className="mb-1">
                <img
                  src={message.attachment.url}
                  alt={message.attachment.originalName}
                  className="rounded-lg max-w-[280px] max-h-[280px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => onImageClick?.(message.attachment!.url, message.attachment!.originalName)}
                />
              </div>
            )}
            {message.type === 'video' && message.attachment && (
              <div className="mb-1">
                <video
                  src={message.attachment.url}
                  controls
                  className="rounded-lg max-w-[280px] max-h-[280px]"
                />
              </div>
            )}
            {message.type === 'audio' && message.attachment && (
              <div className="mb-1 flex items-center gap-2">
                <audio src={message.attachment.url} controls className="max-w-[240px]" />
              </div>
            )}
            {message.type === 'file' && message.attachment && (
              <div className="flex items-center gap-3 mb-1 p-2 rounded-lg" style={{ backgroundColor: isOwn ? 'rgba(255,255,255,0.1)' : 'var(--color-bg-tertiary)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-primary)', }}>
                  <span className="text-white text-xs font-bold">FILE</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: isOwn ? '#fff' : 'var(--color-text)' }}>
                    {message.attachment.originalName}
                  </p>
                  <p className="text-xs" style={{ color: isOwn ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }}>
                    {(message.attachment.size / 1024).toFixed(1)} KB
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

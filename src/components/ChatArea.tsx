import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Message } from '../types';
import { getMessages, updateMessage as storeUpdateMessage, deleteMessage as storeDeleteMessage, isSavedMessagesConversation } from '../store';
import { ArrowLeft, Phone, Video, MoreVertical, Send, Mic, Paperclip, X, Reply, Edit3, Trash2, Copy, Forward, Bookmark } from 'lucide-react';
import Avatar from './Avatar';
import MessageBubble from './MessageBubble';
import EmojiPicker from './EmojiPicker';
import VoiceRecorder from './VoiceRecorder';
import FileDropZone from './FileDropZone';
import ImageViewer from './ImageViewer';
import { format } from 'date-fns';

interface Props {
  onBack?: () => void;
}

export default function ChatArea({ onBack }: Props) {
  const { state, dispatch, sendMessage, getOtherUser, isUserOnline } = useApp();
  const [inputText, setInputText] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: Message } | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [viewingImage, setViewingImage] = useState<{ src: string; alt: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = state.conversations.find(c => c.id === state.activeConversationId);
  const isSaved = activeConv && state.currentUser ? isSavedMessagesConversation(activeConv, state.currentUser.id) : false;
  const otherUser = activeConv ? getOtherUser(activeConv) : undefined;
  const isOnline = otherUser && !isSaved ? isUserOnline(otherUser.id) : false;
  const isTyping = !isSaved && state.typingUsers.some(t => t.conversationId === state.activeConversationId);

  useEffect(() => {
    if (state.activeConversationId) {
      const msgs = getMessages(state.activeConversationId);
      dispatch({ type: 'SET_MESSAGES', messages: msgs });
    } else {
      dispatch({ type: 'SET_MESSAGES', messages: [] });
    }
  }, [state.activeConversationId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages.length]);

  const handleSend = useCallback(() => {
    if (!inputText.trim() || !state.activeConversationId) return;

    if (editingMessage) {
      storeUpdateMessage(editingMessage.id, { text: inputText.trim(), updatedAt: new Date().toISOString() });
      dispatch({
        type: 'UPDATE_MESSAGE',
        id: editingMessage.id,
        data: { text: inputText.trim(), updatedAt: new Date().toISOString() },
      });
      setEditingMessage(null);
    } else {
      sendMessage(state.activeConversationId, {
        type: 'text',
        text: inputText.trim(),
        replyToId: replyTo?.id,
      });
      setReplyTo(null);
    }
    setInputText('');
    inputRef.current?.focus();
  }, [inputText, state.activeConversationId, editingMessage, replyTo, sendMessage, dispatch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, message });
  };

  const handleDeleteMessage = (messageId: string, forEveryone: boolean) => {
    storeDeleteMessage(messageId, forEveryone);
    if (forEveryone) {
      dispatch({
        type: 'UPDATE_MESSAGE',
        id: messageId,
        data: { deletedAt: new Date().toISOString(), text: undefined, attachment: undefined },
      });
    } else {
      dispatch({
        type: 'SET_MESSAGES',
        messages: state.messages.filter(m => m.id !== messageId),
      });
    }
    setContextMenu(null);
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
    setEditingMessage(null);
    setContextMenu(null);
    inputRef.current?.focus();
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setInputText(message.text || '');
    setReplyTo(null);
    setContextMenu(null);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handler = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handler);
      return () => document.removeEventListener('click', handler);
    }
  }, [contextMenu]);

  const handleFileSend = (file: File) => {
    if (!state.activeConversationId) return;
    const url = URL.createObjectURL(file);
    let type: 'image' | 'video' | 'file' = 'file';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';

    sendMessage(state.activeConversationId, {
      type,
      attachment: {
        id: `att-${Date.now()}`,
        fileName: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url,
      },
    });
  };

  if (!activeConv || (!otherUser && !isSaved)) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            <Send className="w-12 h-12" style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Выберите чат</h2>
          <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--color-text-muted)' }}>Найдите пользователя через поиск и начните общение</p>
        </div>
      </div>
    );
  }

  const groupedMessages: { date: string; messages: Message[] }[] = [];
  state.messages.forEach(msg => {
    const date = format(new Date(msg.createdAt), 'd MMMM yyyy');
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === date) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date, messages: [msg] });
    }
  });

  const formatLastSeen = (dateStr: string) => {
    const d = new Date(dateStr);
    return `был(а) ${format(d, 'd MMM в HH:mm')}`;
  };

  return (
    <FileDropZone onSend={handleFileSend}>
    <div className="flex-1 flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        {onBack && (
          <button onClick={onBack} className="p-1 rounded-lg lg:hidden" style={{ color: 'var(--color-text-secondary)' }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        {isSaved ? (
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-primary)' }}>
            <Bookmark className="w-5 h-5 text-white fill-white" />
          </div>
        ) : (
          otherUser && <Avatar user={otherUser} size={40} />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: isSaved ? 'var(--color-primary)' : 'var(--color-text)' }}>
            {isSaved ? 'Сохранённые сообщения' : otherUser?.name}
          </p>
          <p className="text-xs" style={{ color: isTyping ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
            {isSaved ? 'Заметки и важные сообщения' : isTyping ? 'печатает...' : isOnline ? 'в сети' : otherUser ? formatLastSeen(otherUser.lastSeen) : ''}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg transition-all-fast hover:opacity-70 hidden sm:block" style={{ color: 'var(--color-text-secondary)' }}>
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg transition-all-fast hover:opacity-70 hidden sm:block" style={{ color: 'var(--color-text-secondary)' }}>
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg transition-all-fast hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 relative" style={{
        backgroundImage: `radial-gradient(circle at 25px 25px, var(--color-border) 1px, transparent 0)`,
        backgroundSize: '50px 50px',
        backgroundPosition: '0 0',
        opacity: 1,
      }}>
        {groupedMessages.map(group => (
          <div key={group.date}>
            <div className="flex justify-center my-4">
              <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
                {group.date}
              </span>
            </div>
            {group.messages.map(msg => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={isSaved || msg.senderId === state.currentUser?.id}
                onContextMenu={handleContextMenu}
                onReply={handleReply}
                onImageClick={(src, alt) => setViewingImage({ src, alt })}
                allMessages={state.messages}
              />
            ))}
          </div>
        ))}
        {isTyping && otherUser && (
          <div className="flex items-center gap-2 mb-2">
            <Avatar user={otherUser} size={28} />
            <div className="px-4 py-2.5 rounded-2xl" style={{ backgroundColor: 'var(--color-msg-in)' }}>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full typing-dot" style={{ backgroundColor: 'var(--color-text-muted)' }} />
                <div className="w-2 h-2 rounded-full typing-dot" style={{ backgroundColor: 'var(--color-text-muted)' }} />
                <div className="w-2 h-2 rounded-full typing-dot" style={{ backgroundColor: 'var(--color-text-muted)' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply/Edit Preview */}
      {(replyTo || editingMessage) && (
        <div className="px-4 py-2 flex items-center gap-3" style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
              {editingMessage ? 'Редактирование' : 'Ответ'}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
              {editingMessage ? editingMessage.text : replyTo?.text}
            </p>
          </div>
          <button onClick={() => { setReplyTo(null); setEditingMessage(null); setInputText(''); }} className="p-1" style={{ color: 'var(--color-text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3" style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div className="flex items-end gap-2">
          <button className="p-2 rounded-lg transition-all-fast hover:opacity-70 flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
            <Paperclip className="w-5 h-5" />
          </button>
          <EmojiPicker onSelect={(emoji) => setInputText(prev => prev + emoji)} />
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите сообщение..."
              rows={1}
              className="w-full px-4 py-2.5 rounded-2xl text-sm resize-none transition-all-fast"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                maxHeight: '120px',
              }}
            />
          </div>
          {inputText.trim() ? (
            <button
              onClick={handleSend}
              className="p-2.5 rounded-full transition-all-fast hover:opacity-90 flex-shrink-0"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          ) : (
            <button
              onClick={() => setIsRecordingVoice(true)}
              className="p-2.5 rounded-full transition-all-fast hover:opacity-70 flex-shrink-0"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Voice Recorder */}
      {isRecordingVoice && (
        <VoiceRecorder
          onSend={(blob, duration) => {
            if (state.activeConversationId) {
              const url = URL.createObjectURL(blob);
              sendMessage(state.activeConversationId, {
                type: 'audio',
                attachment: {
                  id: `att-${Date.now()}`,
                  fileName: `voice-${Date.now()}.webm`,
                  originalName: 'Голосовое сообщение',
                  mimeType: 'audio/webm',
                  size: blob.size,
                  url,
                  duration,
                },
              });
            }
            setIsRecordingVoice(false);
          }}
          onCancel={() => setIsRecordingVoice(false)}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 rounded-xl shadow-xl py-2 min-w-[180px] animate-fade-in"
          style={{
            top: Math.min(contextMenu.y, window.innerHeight - 280),
            left: Math.min(contextMenu.x, window.innerWidth - 200),
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => handleReply(contextMenu.message)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all-fast hover:opacity-80 text-left" style={{ color: 'var(--color-text)' }}>
            <Reply className="w-4 h-4" /> Ответить
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all-fast hover:opacity-80 text-left" style={{ color: 'var(--color-text)' }}>
            <Copy className="w-4 h-4" /> Копировать
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all-fast hover:opacity-80 text-left" style={{ color: 'var(--color-text)' }}>
            <Forward className="w-4 h-4" /> Переслать
          </button>
          {contextMenu.message.senderId === state.currentUser?.id && (
            <button onClick={() => handleEdit(contextMenu.message)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all-fast hover:opacity-80 text-left" style={{ color: 'var(--color-text)' }}>
              <Edit3 className="w-4 h-4" /> Редактировать
            </button>
          )}
          <div className="my-1" style={{ borderTop: '1px solid var(--color-border)' }} />
          {contextMenu.message.senderId === state.currentUser?.id ? (
            <>
              <button onClick={() => handleDeleteMessage(contextMenu.message.id, false)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all-fast hover:opacity-80 text-left" style={{ color: 'var(--color-text)' }}>
                <Trash2 className="w-4 h-4" /> Удалить у себя
              </button>
              <button onClick={() => handleDeleteMessage(contextMenu.message.id, true)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all-fast hover:opacity-80 text-left" style={{ color: 'var(--color-danger)' }}>
                <Trash2 className="w-4 h-4" /> Удалить у всех
              </button>
            </>
          ) : (
            <button onClick={() => handleDeleteMessage(contextMenu.message.id, false)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all-fast hover:opacity-80 text-left" style={{ color: 'var(--color-danger)' }}>
              <Trash2 className="w-4 h-4" /> Удалить у себя
            </button>
          )}
        </div>
      )}
    </div>

    {/* Image Viewer */}
    {viewingImage && (
      <ImageViewer
        src={viewingImage.src}
        alt={viewingImage.alt}
        onClose={() => setViewingImage(null)}
      />
    )}
    </FileDropZone>
  );
}

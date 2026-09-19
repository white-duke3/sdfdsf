import React, { useState, useMemo } from 'react';
import { X, Image, Film, FileAudio, File, ArrowLeft } from 'lucide-react';
import { Message } from '../types';
import { format } from 'date-fns';

interface Props {
  messages: Message[];
  userName: string;
  userAvatar?: string;
  onClose: () => void;
  onImageClick: (src: string, alt: string) => void;
}

type TabType = 'all' | 'photos' | 'videos' | 'audio' | 'files';

export default function ChatMediaViewer({ messages, userName, userAvatar, onClose, onImageClick }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const mediaStats = useMemo(() => {
    const photos = messages.filter(m => m.type === 'image' && !m.deletedAt);
    const videos = messages.filter(m => m.type === 'video' && !m.deletedAt);
    const audio = messages.filter(m => m.type === 'audio' && !m.deletedAt);
    const files = messages.filter(m => m.type === 'file' && !m.deletedAt);
    return { photos, videos, audio, files };
  }, [messages]);

  const filteredMessages = useMemo(() => {
    const nonDeleted = messages.filter(m => !m.deletedAt);
    switch (activeTab) {
      case 'photos': return mediaStats.photos;
      case 'videos': return mediaStats.videos;
      case 'audio': return mediaStats.audio;
      case 'files': return mediaStats.files;
      default: return nonDeleted.filter(m => ['image', 'video', 'audio', 'file'].includes(m.type));
    }
  }, [activeTab, messages, mediaStats]);

  // Sort from newest to oldest
  const sortedMessages = useMemo(() => {
    return [...filteredMessages].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredMessages]);

  const allTabs = [
    { id: 'all' as TabType, label: 'Все', icon: null as React.ReactNode | null, count: mediaStats.photos.length + mediaStats.videos.length + mediaStats.audio.length + mediaStats.files.length },
    { id: 'photos' as TabType, label: 'Фото', icon: <Image className="w-4 h-4" /> as React.ReactNode, count: mediaStats.photos.length },
    { id: 'videos' as TabType, label: 'Видео', icon: <Film className="w-4 h-4" /> as React.ReactNode, count: mediaStats.videos.length },
    { id: 'audio' as TabType, label: 'Голосовые', icon: <FileAudio className="w-4 h-4" /> as React.ReactNode, count: mediaStats.audio.length },
    { id: 'files' as TabType, label: 'Файлы', icon: <File className="w-4 h-4" /> as React.ReactNode, count: mediaStats.files.length },
  ];
  
  const tabs = allTabs.filter(t => t.id === 'all' || t.count > 0);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="w-full max-w-2xl mx-auto flex flex-col h-full animate-slide-in">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <button onClick={onClose} className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-secondary)' }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Медиа и файлы</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Общие с {userName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-secondary)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-2 overflow-x-auto" style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all-fast"
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                color: activeTab === tab.id ? 'white' : 'var(--color-text-secondary)',
              }}
            >
              {tab.icon}
              {tab.label}
              <span className="opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {sortedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                <File className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Нет файлов</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>В этой переписке пока нет медиа</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedMessages.map(msg => (
                <div key={msg.id} className="animate-fade-in">
                  <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                    {format(new Date(msg.createdAt), 'd MMMM yyyy, HH:mm')}
                  </p>
                  
                  {msg.type === 'image' && msg.attachment && (
                    <div className="grid grid-cols-3 gap-2">
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => onImageClick(msg.attachment!.url, msg.attachment!.originalName)}
                      >
                        <img src={msg.attachment.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                  {msg.type === 'video' && msg.attachment && (
                    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                      <video src={msg.attachment.url} controls className="w-full max-h-[300px]" />
                    </div>
                  )}

                  {msg.type === 'audio' && msg.attachment && (
                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                      <button 
                        onClick={() => {
                          const audio = new Audio(msg.attachment!.url);
                          audio.play();
                        }}
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      >
                        <svg className="w-4 h-4 ml-0.5" fill="white" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-0.5 h-6">
                          {Array.from({ length: 25 }).map((_, i) => {
                            const seed = msg.id ? msg.id.charCodeAt(i % msg.id.length) : i;
                            const height = 4 + Math.sin(i * 0.5 + seed * 0.1) * 8;
                            return (
                              <div
                                key={i}
                                className="w-0.5 rounded-full"
                                style={{
                                  height: `${Math.max(3, height)}px`,
                                  backgroundColor: 'var(--color-primary)',
                                  opacity: 0.5,
                                }}
                              />
                            );
                          })}
                        </div>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {formatDuration(msg.attachment.duration)}
                        </span>
                      </div>
                    </div>
                  )}

                  {msg.type === 'file' && msg.attachment && (
                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-primary)' }}>
                        <File className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                          {msg.attachment.originalName}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {formatSize(msg.attachment.size)}
                        </p>
                      </div>
                      <a 
                        href={msg.attachment.url} 
                        download={msg.attachment.originalName}
                        className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

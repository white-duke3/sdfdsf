import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { Search, Settings, Moon, Sun, MessageCircle } from 'lucide-react';
import { searchUsers, getOrCreateConversation, getConversations, isSavedMessagesConversation } from '../store';
import Avatar from '../components/Avatar';
import { Bookmark } from 'lucide-react';

interface Props {
  onOpenSettings: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ onOpenSettings, isMobile }: Props) {
  const { state, dispatch, getOtherUser, isUserOnline, logout, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const sortedConversations = useMemo(() => {
    if (!state.currentUser) return [];
    const userId = state.currentUser.id;
    return [...state.conversations].sort((a, b) => {
      // Saved messages always first
      const aIsSaved = isSavedMessagesConversation(a, userId);
      const bIsSaved = isSavedMessagesConversation(b, userId);
      if (aIsSaved && !bIsSaved) return -1;
      if (!aIsSaved && bIsSaved) return 1;
      
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : new Date(a.createdAt).getTime();
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
  }, [state.conversations, state.currentUser]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery || showSearch) return sortedConversations;
    const q = searchQuery.toLowerCase();
    return sortedConversations.filter(c => {
      const other = getOtherUser(c);
      return other && (other.name.toLowerCase().includes(q) || other.username.toLowerCase().includes(q));
    });
  }, [sortedConversations, searchQuery, showSearch, getOtherUser]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 1 && state.currentUser) {
      const results = searchUsers(query, state.currentUser.id);
      setSearchResults(results);
      setShowSearch(true);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  };

  const handleSelectUser = (user: User) => {
    if (!state.currentUser) return;
    const conv = getOrCreateConversation(state.currentUser.id, user.id);
    const convs = getConversations(state.currentUser.id);
    dispatch({ type: 'SET_CONVERSATIONS', conversations: convs });
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', id: conv.id });
    setSearchQuery('');
    setShowSearch(false);
  };

  const getLastMessagePreview = (conv: typeof state.conversations[0]): string => {
    if (!conv.lastMessage) return 'Нет сообщений';
    if (conv.lastMessage.deletedAt) return 'Сообщение удалено';
    switch (conv.lastMessage.type) {
      case 'image': return '📷 Фото';
      case 'video': return '🎥 Видео';
      case 'audio': return '🎤 Голосовое сообщение';
      case 'file': return '📎 Файл';
      default: return conv.lastMessage.text || '';
    }
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) {
      return date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 604800000) {
      return date.toLocaleDateString('ru', { weekday: 'short' });
    }
    return date.toLocaleDateString('ru', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-full ${isMobile ? 'w-full' : 'w-80 lg:w-96'} border-r`} style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>ChatFlow</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              dispatch({ type: 'SET_THEME', theme: state.theme === 'light' ? 'dark' : 'light' });
            }}
            className="p-2 rounded-lg transition-all-fast hover:opacity-80"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Сменить тему"
          >
            {state.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg transition-all-fast hover:opacity-80"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Настройки"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Поиск пользователей или чатов..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all-fast"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
          />
        </div>
      </div>

      {/* Search Results */}
      {showSearch && searchResults.length > 0 && (
        <div className="px-3 pb-2">
          <p className="text-xs font-medium mb-2 px-1" style={{ color: 'var(--color-text-muted)' }}>ПОЛЬЗОВАТЕЛИ</p>
          <div className="space-y-1">
            {searchResults.map(user => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all-fast hover:opacity-80 text-left"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
              >
                <Avatar user={user} size={40} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{user.name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>@{user.username}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showSearch && searchResults.length === 0 && searchQuery.length >= 1 && (
        <div className="px-4 py-8 text-center">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Пользователи не найдены</p>
        </div>
      )}

      {/* Conversations List */}
      {!showSearch && (
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                <MessageCircle className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Нет диалогов</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Найдите пользователя через поиск</p>
            </div>
          ) : (
            <div className="py-1">
              {filteredConversations.map(conv => {
                if (!state.currentUser) return null;
                const isSaved = isSavedMessagesConversation(conv, state.currentUser.id);
                const other = getOtherUser(conv);
                if (!other && !isSaved) return null;
                const isActive = state.activeConversationId === conv.id;
                const online = other ? isUserOnline(other.id) : false;

                return (
                  <button
                    key={conv.id}
                    onClick={() => dispatch({ type: 'SET_ACTIVE_CONVERSATION', id: conv.id })}
                    className="w-full flex items-center gap-3 px-4 py-3 transition-all-fast text-left"
                    style={{
                      backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                    }}
                  >
                    <div className="relative flex-shrink-0">
                      {isSaved ? (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
                          <Bookmark className="w-6 h-6 text-white fill-white" />
                        </div>
                      ) : (
                        <>
                          <Avatar user={other!} size={48} />
                          {online && (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2" style={{ backgroundColor: 'var(--color-success)', borderColor: 'var(--color-surface)' }} />
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold truncate" style={{ color: isSaved ? 'var(--color-primary)' : 'var(--color-text)' }}>
                          {isSaved ? 'Сохранённые сообщения' : other!.name}
                        </p>
                        {conv.lastMessage && (
                          <span className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--color-text-muted)' }}>
                            {formatTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs truncate" style={{ color: isSaved ? 'var(--color-primary)' : 'var(--color-text-secondary)', opacity: isSaved ? 0.8 : 1 }}>
                          {isSaved ? 'Заметки, ссылки, файлы' : getLastMessagePreview(conv)}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="flex-shrink-0 ml-2 min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-medium text-white px-1.5" style={{ backgroundColor: 'var(--color-primary)' }}>
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { User, Conversation, Message, TypingState } from '../types';
import * as store from '../store';

interface AppState {
  currentUser: User | null;
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  typingUsers: TypingState[];
  theme: 'light' | 'dark';
  settings: store.AppSettings;
  onlineUsers: Set<string>;
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
}

type Action =
  | { type: 'SET_USER'; user: User | null }
  | { type: 'SET_CONVERSATIONS'; conversations: Conversation[] }
  | { type: 'SET_ACTIVE_CONVERSATION'; id: string | null }
  | { type: 'SET_MESSAGES'; messages: Message[] }
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'UPDATE_MESSAGE'; id: string; data: Partial<Message> }
  | { type: 'SET_TYPING'; typing: TypingState }
  | { type: 'SET_THEME'; theme: 'light' | 'dark' }
  | { type: 'SET_SETTINGS'; settings: store.AppSettings }
  | { type: 'SET_ONLINE'; userId: string; online: boolean }
  | { type: 'ADD_TOAST'; toast: { id: string; message: string; type: 'success' | 'error' | 'info' } }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'UPDATE_CONVERSATION'; id: string; data: Partial<Conversation> };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.user };
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.conversations };
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.id };
    case 'SET_MESSAGES':
      return { ...state, messages: action.messages };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(m =>
          m.id === action.id ? { ...m, ...action.data } : m
        ),
      };
    case 'SET_TYPING':
      return {
        ...state,
        typingUsers: state.typingUsers.filter(
          t => !(t.conversationId === action.typing.conversationId && t.userId === action.typing.userId)
        ).concat(action.typing.isTyping ? [action.typing] : []),
      };
    case 'SET_THEME':
      return { ...state, theme: action.theme };
    case 'SET_SETTINGS':
      return { ...state, settings: action.settings };
    case 'SET_ONLINE': {
      const newSet = new Set(state.onlineUsers);
      if (action.online) newSet.add(action.userId);
      else newSet.delete(action.userId);
      return { ...state, onlineUsers: newSet };
    }
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) };
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.id ? { ...c, ...action.data } : c
        ),
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  login: (email: string, password: string) => string | null;
  register: (data: { name: string; username: string; email: string; password: string }) => string | null;
  logout: () => void;
  sendMessage: (conversationId: string, message: Partial<Message>) => void;
  getOtherUser: (conv: Conversation) => User | undefined;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  isUserOnline: (userId: string) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    currentUser: null,
    conversations: [],
    activeConversationId: null,
    messages: [],
    typingUsers: [],
    theme: store.getTheme(),
    settings: store.getSettings(),
    onlineUsers: new Set(['user-alice', 'user-bob']),
    toasts: [],
  });

  // Initialize
  useEffect(() => {
    store.initializeStore();
    const user = store.getCurrentUser();
    if (user) {
      dispatch({ type: 'SET_USER', user });
      const convs = store.getConversations(user.id);
      dispatch({ type: 'SET_CONVERSATIONS', conversations: convs });
    }
  }, []);

  // Theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    store.setTheme(state.theme);
  }, [state.theme]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}`;
    dispatch({ type: 'ADD_TOAST', toast: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 4000);
  }, []);

  const login = useCallback((email: string, password: string): string | null => {
    const result = store.loginUser(email, password);
    if ('error' in result) return result.error;
    const user = result;
    store.setCurrentUser(user);
    dispatch({ type: 'SET_USER', user });
    const convs = store.getConversations(user.id);
    dispatch({ type: 'SET_CONVERSATIONS', conversations: convs });
    return null;
  }, []);

  const register = useCallback((data: { name: string; username: string; email: string; password: string }): string | null => {
    const result = store.registerUser(data);
    if ('error' in result) return result.error;
    const user = result;
    store.setCurrentUser(user);
    dispatch({ type: 'SET_USER', user });
    dispatch({ type: 'SET_CONVERSATIONS', conversations: [] });
    return null;
  }, []);

  const logout = useCallback(() => {
    if (state.currentUser) {
      store.updateUser(state.currentUser.id, { online: false, lastSeen: new Date().toISOString() });
    }
    store.setCurrentUser(null);
    dispatch({ type: 'SET_USER', user: null });
    dispatch({ type: 'SET_CONVERSATIONS', conversations: [] });
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', id: null });
    dispatch({ type: 'SET_MESSAGES', messages: [] });
  }, [state.currentUser]);

  const sendMessage = useCallback((conversationId: string, messageData: Partial<Message>) => {
    if (!state.currentUser) return;

    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      conversationId,
      senderId: state.currentUser.id,
      type: messageData.type || 'text',
      text: messageData.text,
      replyToId: messageData.replyToId,
      attachment: messageData.attachment,
      status: 'sent',
      createdAt: new Date().toISOString(),
      readBy: [state.currentUser.id],
    };

    store.addMessage(message);
    dispatch({ type: 'ADD_MESSAGE', message });

    // Update conversation
    store.updateConversation(conversationId, { lastMessage: message });
    dispatch({
      type: 'UPDATE_CONVERSATION',
      id: conversationId,
      data: { lastMessage: message },
    });

    // Simulate delivery
    setTimeout(() => {
      store.updateMessage(message.id, { status: 'delivered' });
      dispatch({ type: 'UPDATE_MESSAGE', id: message.id, data: { status: 'delivered' } });
    }, 500);

    // Simulate auto-reply for demo
    const conv = store.getConversationById(conversationId);
    if (conv) {
      const otherUserId = conv.members.find(m => m !== state.currentUser!.id);
      if (otherUserId) {
        // Show typing
        setTimeout(() => {
          dispatch({
            type: 'SET_TYPING',
            typing: { conversationId, userId: otherUserId, isTyping: true },
          });
        }, 1000);

        // Auto reply
        setTimeout(() => {
          dispatch({
            type: 'SET_TYPING',
            typing: { conversationId, userId: otherUserId, isTyping: false },
          });

          const replies = [
            'Привет! Как дела? 👋',
            'Отлично, спасибо! 😊',
            'Интересно, расскажи подробнее',
            'Хорошо, договорились! 👍',
            'Понял, спасибо за информацию',
            'Ок, буду иметь в виду',
          ];
          const replyText = replies[Math.floor(Math.random() * replies.length)];

          const reply: Message = {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            conversationId,
            senderId: otherUserId,
            type: 'text',
            text: replyText,
            status: 'delivered',
            createdAt: new Date().toISOString(),
            readBy: [otherUserId, state.currentUser!.id],
          };

          store.addMessage(reply);
          dispatch({ type: 'ADD_MESSAGE', message: reply });
          store.updateConversation(conversationId, { lastMessage: reply });
          dispatch({
            type: 'UPDATE_CONVERSATION',
            id: conversationId,
            data: { lastMessage: reply },
          });

          // Mark original as read
          store.updateMessage(message.id, { status: 'read', readBy: [state.currentUser!.id, otherUserId] });
          dispatch({
            type: 'UPDATE_MESSAGE',
            id: message.id,
            data: { status: 'read', readBy: [state.currentUser!.id, otherUserId] },
          });
        }, 2500 + Math.random() * 2000);
      }
    }
  }, [state.currentUser]);

  const getOtherUser = useCallback((conv: Conversation): User | undefined => {
    if (!state.currentUser) return undefined;
    const otherId = conv.members.find(m => m !== state.currentUser!.id);
    return otherId ? store.getUserById(otherId) : undefined;
  }, [state.currentUser]);

  const isUserOnline = useCallback((userId: string): boolean => {
    return state.onlineUsers.has(userId);
  }, [state.onlineUsers]);

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      login,
      register,
      logout,
      sendMessage,
      getOtherUser,
      addToast,
      isUserOnline,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

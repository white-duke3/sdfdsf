export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  online: boolean;
  lastSeen: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: 'direct';
  members: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  text?: string;
  replyToId?: string;
  forwardedFrom?: string;
  attachment?: Attachment;
  attachments?: Attachment[]; // Для коллажей из нескольких медиа
  status: MessageStatus;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  readBy: string[];
}

export interface Attachment {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface TypingState {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

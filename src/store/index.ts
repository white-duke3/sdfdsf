import { User, Conversation, Message } from '../types';

const STORAGE_KEYS = {
  USERS: 'chatflow_users',
  MESSAGES: 'chatflow_messages',
  CONVERSATIONS: 'chatflow_conversations',
  CURRENT_USER: 'chatflow_current_user',
  THEME: 'chatflow_theme',
  SETTINGS: 'chatflow_settings',
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Seed data
const seedUsers: User[] = [
  {
    id: 'user-alice',
    name: 'Alice Johnson',
    username: 'alice',
    email: 'alice@chatflow.app',
    bio: 'Designer & coffee lover ☕',
    online: true,
    lastSeen: new Date().toISOString(),
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'user-bob',
    name: 'Bob Smith',
    username: 'bob',
    email: 'bob@chatflow.app',
    bio: 'Full-stack developer 💻',
    online: true,
    lastSeen: new Date().toISOString(),
    createdAt: '2024-01-16T10:00:00Z',
  },
  {
    id: 'user-john',
    name: 'John Davis',
    username: 'john',
    email: 'john@chatflow.app',
    bio: 'Musician & night owl 🎸',
    online: false,
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    createdAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'user-maria',
    name: 'Maria Garcia',
    username: 'maria',
    email: 'maria@chatflow.app',
    bio: 'Traveler 🌍 | Photographer 📷',
    online: false,
    lastSeen: new Date(Date.now() - 7200000).toISOString(),
    createdAt: '2024-02-10T10:00:00Z',
  },
];

export function initializeStore(): void {
  const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
  if (users.length === 0) {
    setItem(STORAGE_KEYS.USERS, seedUsers);
    // Set passwords for seed users
    const passwords: Record<string, string> = {};
    seedUsers.forEach(u => {
      passwords[u.id] = btoa('password123');
    });
    setItem('chatflow_passwords', passwords);

    // Create seed conversations and messages
    const conv1: Conversation = {
      id: 'conv-alice-bob',
      type: 'direct',
      members: ['user-alice', 'user-bob'],
      unreadCount: 0,
      createdAt: '2024-03-01T10:00:00Z',
    };
    const conv2: Conversation = {
      id: 'conv-alice-john',
      type: 'direct',
      members: ['user-alice', 'user-john'],
      unreadCount: 1,
      createdAt: '2024-03-02T10:00:00Z',
    };
    const conv3: Conversation = {
      id: 'conv-bob-maria',
      type: 'direct',
      members: ['user-bob', 'user-maria'],
      unreadCount: 0,
      createdAt: '2024-03-03T10:00:00Z',
    };
    // Create saved messages conversations for seed users
    const savedConvAlice: Conversation = {
      id: 'saved-user-alice',
      type: 'direct',
      members: ['user-alice', 'user-alice'],
      unreadCount: 0,
      createdAt: '2024-01-15T10:00:00Z',
    };
    const savedConvBob: Conversation = {
      id: 'saved-user-bob',
      type: 'direct',
      members: ['user-bob', 'user-bob'],
      unreadCount: 0,
      createdAt: '2024-01-16T10:00:00Z',
    };
    const savedConvJohn: Conversation = {
      id: 'saved-user-john',
      type: 'direct',
      members: ['user-john', 'user-john'],
      unreadCount: 0,
      createdAt: '2024-02-01T10:00:00Z',
    };
    const savedConvMaria: Conversation = {
      id: 'saved-user-maria',
      type: 'direct',
      members: ['user-maria', 'user-maria'],
      unreadCount: 0,
      createdAt: '2024-02-10T10:00:00Z',
    };

    // Seed messages
    const now = Date.now();
    const seedMessages: Message[] = [
      {
        id: 'msg-seed-1',
        conversationId: 'conv-alice-bob',
        senderId: 'user-alice',
        type: 'text',
        text: 'Привет, Bob! Как дела? 👋',
        status: 'read',
        createdAt: new Date(now - 3600000).toISOString(),
        readBy: ['user-alice', 'user-bob'],
      },
      {
        id: 'msg-seed-2',
        conversationId: 'conv-alice-bob',
        senderId: 'user-bob',
        type: 'text',
        text: 'Привет, Alice! Всё отлично, работаю над новым проектом 💻',
        status: 'read',
        createdAt: new Date(now - 3500000).toISOString(),
        readBy: ['user-alice', 'user-bob'],
      },
      {
        id: 'msg-seed-3',
        conversationId: 'conv-alice-bob',
        senderId: 'user-alice',
        type: 'text',
        text: 'Круто! Расскажешь подробнее?',
        status: 'read',
        createdAt: new Date(now - 3400000).toISOString(),
        readBy: ['user-alice', 'user-bob'],
      },
      {
        id: 'msg-seed-4',
        conversationId: 'conv-alice-bob',
        senderId: 'user-bob',
        type: 'text',
        text: 'Конечно! Делаем мессенджер на React + TypeScript. Очень интересный проект 🚀',
        status: 'delivered',
        createdAt: new Date(now - 3300000).toISOString(),
        readBy: ['user-bob'],
      },
      {
        id: 'msg-seed-5',
        conversationId: 'conv-alice-john',
        senderId: 'user-john',
        type: 'text',
        text: 'Alice, привет! Послушай новый трек 🎸',
        status: 'delivered',
        createdAt: new Date(now - 7200000).toISOString(),
        readBy: ['user-john'],
      },
      {
        id: 'msg-seed-6',
        conversationId: 'conv-bob-maria',
        senderId: 'user-maria',
        type: 'text',
        text: 'Bob, смотри какие фото из поездки! 📷🌍',
        status: 'read',
        createdAt: new Date(now - 86400000).toISOString(),
        readBy: ['user-bob', 'user-maria'],
      },
      {
        id: 'msg-seed-7',
        conversationId: 'conv-bob-maria',
        senderId: 'user-bob',
        type: 'text',
        text: 'Вау, потрясающие снимки! Где это?',
        status: 'read',
        createdAt: new Date(now - 86300000).toISOString(),
        readBy: ['user-bob', 'user-maria'],
      },
      // Saved messages for Alice
      {
        id: 'msg-seed-saved-1',
        conversationId: 'saved-user-alice',
        senderId: 'user-alice',
        type: 'text',
        text: 'Не забыть купить продукты 🛒',
        status: 'read',
        createdAt: new Date(now - 172800000).toISOString(),
        readBy: ['user-alice'],
      },
      {
        id: 'msg-seed-saved-2',
        conversationId: 'saved-user-alice',
        senderId: 'user-alice',
        type: 'text',
        text: 'https://example.com/interesting-article - прочитать позже',
        status: 'read',
        createdAt: new Date(now - 86400000).toISOString(),
        readBy: ['user-alice'],
      },
      // Saved messages for Bob
      {
        id: 'msg-seed-saved-3',
        conversationId: 'saved-user-bob',
        senderId: 'user-bob',
        type: 'text',
        text: 'TODO: Закончить рефакторинг API',
        status: 'read',
        createdAt: new Date(now - 259200000).toISOString(),
        readBy: ['user-bob'],
      },
    ];
    setItem(STORAGE_KEYS.MESSAGES, seedMessages);

    // Update last messages in conversations
    conv1.lastMessage = seedMessages[3];
    conv2.lastMessage = seedMessages[4];
    conv3.lastMessage = seedMessages[6];
    savedConvAlice.lastMessage = seedMessages[9]; // msg-seed-saved-2
    savedConvBob.lastMessage = seedMessages[10]; // msg-seed-saved-3
    setItem(STORAGE_KEYS.CONVERSATIONS, [conv1, conv2, conv3, savedConvAlice, savedConvBob, savedConvJohn, savedConvMaria]);
  } else {
    // Migration: ensure all existing users have saved messages conversations
    const conversations = getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    let updated = false;
    
    users.forEach(user => {
      const savedConvId = `saved-${user.id}`;
      const exists = conversations.find(c => c.id === savedConvId);
      if (!exists) {
        conversations.push({
          id: savedConvId,
          type: 'direct',
          members: [user.id, user.id],
          unreadCount: 0,
          createdAt: user.createdAt,
        });
        updated = true;
      }
    });
    
    if (updated) {
      setItem(STORAGE_KEYS.CONVERSATIONS, conversations);
    }
  }
}

// Users
export function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS, []);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function getUserByUsername(username: string): User | undefined {
  return getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
}

export function searchUsers(query: string, excludeId?: string): User[] {
  const q = query.toLowerCase();
  return getUsers().filter(u =>
    u.id !== excludeId &&
    (u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q))
  );
}

export function registerUser(data: { name: string; username: string; email: string; password: string }): User | { error: string } {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { error: 'Email уже зарегистрирован' };
  }
  if (users.find(u => u.username.toLowerCase() === data.username.toLowerCase())) {
    return { error: 'Username уже занят' };
  }
  if (data.username.length < 4) {
    return { error: 'Username минимум 4 символа' };
  }
  if (data.password.length < 8) {
    return { error: 'Пароль минимум 8 символов' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
    return { error: 'Username: только латинские буквы, цифры и _' };
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name: data.name,
    username: data.username,
    email: data.email,
    online: true,
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  setItem(STORAGE_KEYS.USERS, users);

  // Store password hash (simplified)
  const passwords = getItem<Record<string, string>>('chatflow_passwords', {});
  passwords[newUser.id] = btoa(data.password);
  setItem('chatflow_passwords', passwords);

  // Create saved messages conversation for new user
  createSavedMessagesConversation(newUser.id);

  return newUser;
}

export function createSavedMessagesConversation(userId: string): Conversation {
  const all = getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  const savedConvId = `saved-${userId}`;
  
  // Check if already exists
  const existing = all.find(c => c.id === savedConvId);
  if (existing) return existing;

  const savedConv: Conversation = {
    id: savedConvId,
    type: 'direct',
    members: [userId, userId], // Same user twice for saved messages
    unreadCount: 0,
    createdAt: new Date().toISOString(),
  };
  all.push(savedConv);
  setItem(STORAGE_KEYS.CONVERSATIONS, all);
  return savedConv;
}

export function getSavedMessagesConversation(userId: string): Conversation | undefined {
  const all = getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  return all.find(c => c.id === `saved-${userId}`);
}

export function isSavedMessagesConversation(conv: Conversation, userId: string): boolean {
  return conv.id === `saved-${userId}`;
}

export function loginUser(email: string, password: string): User | { error: string } {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { error: 'Пользователь не найден' };

  const passwords = getItem<Record<string, string>>('chatflow_passwords', {});
  if (passwords[user.id] !== btoa(password)) {
    return { error: 'Неверный пароль' };
  }

  user.online = true;
  user.lastSeen = new Date().toISOString();
  setItem(STORAGE_KEYS.USERS, users);
  
  // Ensure saved messages conversation exists
  createSavedMessagesConversation(user.id);
  
  return user;
}

export function updateUser(id: string, data: Partial<User>): User | null {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...data };
  setItem(STORAGE_KEYS.USERS, users);
  return users[idx];
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    setItem(STORAGE_KEYS.CURRENT_USER, user);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export function getCurrentUser(): User | null {
  return getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

// Conversations
export function getConversations(userId: string): Conversation[] {
  const all = getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  return all.filter(c => c.members.includes(userId));
}

export function getOrCreateConversation(userId1: string, userId2: string): Conversation {
  const all = getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  const existing = all.find(c =>
    c.type === 'direct' &&
    c.members.includes(userId1) &&
    c.members.includes(userId2)
  );
  if (existing) return existing;

  const conv: Conversation = {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: 'direct',
    members: [userId1, userId2],
    unreadCount: 0,
    createdAt: new Date().toISOString(),
  };
  all.push(conv);
  setItem(STORAGE_KEYS.CONVERSATIONS, all);
  return conv;
}

export function getConversationById(id: string): Conversation | undefined {
  return getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []).find(c => c.id === id);
}

export function updateConversation(id: string, data: Partial<Conversation>): void {
  const all = getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  const idx = all.findIndex(c => c.id === id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...data };
    setItem(STORAGE_KEYS.CONVERSATIONS, all);
  }
}

// Messages
export function getMessages(conversationId: string): Message[] {
  const all = getItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
  return all.filter(m => m.conversationId === conversationId).sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function addMessage(message: Message): void {
  const all = getItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
  all.push(message);
  setItem(STORAGE_KEYS.MESSAGES, all);
}

export function updateMessage(id: string, data: Partial<Message>): void {
  const all = getItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
  const idx = all.findIndex(m => m.id === id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...data };
    setItem(STORAGE_KEYS.MESSAGES, all);
  }
}

export function deleteMessage(id: string, forEveryone: boolean): void {
  const all = getItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
  const idx = all.findIndex(m => m.id === id);
  if (idx !== -1) {
    if (forEveryone) {
      all[idx].text = undefined;
      all[idx].attachment = undefined;
      all[idx].deletedAt = new Date().toISOString();
    } else {
      all.splice(idx, 1);
    }
    setItem(STORAGE_KEYS.MESSAGES, all);
  }
}

// Theme
export function getTheme(): 'light' | 'dark' {
  return getItem<'light' | 'dark'>(STORAGE_KEYS.THEME, 'light');
}

export function setTheme(theme: 'light' | 'dark'): void {
  setItem(STORAGE_KEYS.THEME, theme);
}

// Settings
export interface AppSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export function getSettings(): AppSettings {
  return getItem<AppSettings>(STORAGE_KEYS.SETTINGS, {
    soundEnabled: true,
    notificationsEnabled: true,
  });
}

export function saveSettings(settings: AppSettings): void {
  setItem(STORAGE_KEYS.SETTINGS, settings);
}

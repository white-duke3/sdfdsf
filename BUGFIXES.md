# ChatFlow - Исправления и известные ограничения

## ✅ Исправленные критические баги

### 1. Безопасность смены пароля
**Проблема:** При смене пароля не проверялся текущий пароль. Любой, кто получил доступ к аккаунту, мог сменить пароль.

**Решение:** Добавлена проверка текущего пароля перед сменой:
```typescript
if (passwords[user.id] !== btoa(oldPassword)) {
  addToast('Неверный текущий пароль', 'error');
  return;
}
```

### 2. Откат данных профиля после перезагрузки
**Проблема:** При изменении имени/username данные обновлялись в UI, но не сохранялись в localStorage. После F5 возвращались старые данные.

**Решение:** Добавлена синхронизация с localStorage:
```typescript
const updated = updateUser(user.id, { name, username, bio });
if (updated) {
  dispatch({ type: 'SET_USER', user: updated });
  store.setCurrentUser(updated); // Синхронизация с localStorage
}
```

### 3. Дублирование username через настройки
**Проблема:** При изменении username в настройках не проверялась уникальность. Два пользователя могли получить одинаковый username.

**Решение:** Добавлена проверка уникальности:
```typescript
if (username.toLowerCase() !== user.username.toLowerCase()) {
  const existingUser = getUserByUsername(username);
  if (existingUser) {
    addToast('Этот username уже занят', 'error');
    return;
  }
}
```

### 4. Unread counter не работал
**Проблема:** Счётчик непрочитанных сообщений не увеличивался при получении новых сообщений и не сбрасывался при открытии чата.

**Решение:** 
- При получении сообщения увеличивается unreadCount (если чат не открыт)
- При открытии чата unreadCount сбрасывается в 0

### 5. Синхронизация lastMessage при редактировании/удалении
**Проблема:** При редактировании или удалении последнего сообщения чата, conversation.lastMessage не обновлялся. В sidebar оставался старый текст.

**Решение:** Добавлена синхронизация:
```typescript
// При редактировании
if (activeConv && editingMessage.id === activeConv.lastMessage?.id) {
  const updatedMessage = { ...editingMessage, text: updatedText };
  store.updateConversation(activeConv.id, { lastMessage: updatedMessage });
}

// При удалении
if (deletedMessage && activeConv && deletedMessage.id === activeConv.lastMessage?.id) {
  const newLastMessage = remainingMessages[remainingMessages.length - 1];
  store.updateConversation(activeConv.id, { lastMessage: newLastMessage });
}
```

### 6. Сохранение настроек
**Проблема:** Настройки (звук, уведомления) не сохранялись в localStorage. После F5 возвращались значения по умолчанию.

**Решение:** Добавлен useEffect для сохранения:
```typescript
useEffect(() => {
  store.saveSettings(state.settings);
}, [state.settings]);
```

### 7. Копирование сообщений
**Проблема:** Кнопка "Копировать" в контекстном меню не работала.

**Решение:** Добавлена функциональность:
```typescript
onClick={() => {
  if (contextMenu.message.text) {
    navigator.clipboard.writeText(contextMenu.message.text);
    addToast('Скопировано в буфер обмена', 'success');
  }
}}
```

### 8. Подсветка reply сообщений
**Проблема:** При клике на reply сообщение происходил переход, но без визуальной подсветки.

**Решение:** Добавлена анимация подсветки:
```typescript
el.scrollIntoView({ behavior: 'smooth', block: 'center' });
el.classList.add('animate-pulse');
setTimeout(() => el.classList.remove('animate-pulse'), 2000);
```

### 9. Saved Messages показывал заглушку
**Проблема:** Для "Сохранённых сообщений" всегда показывалось "Заметки, ссылки, файлы" вместо последнего сообщения.

**Решение:** Теперь используется `getLastMessagePreview(conv)` для всех чатов.

### 10. Улучшенный Audio Player
**Проблема:** Голосовые сообщения не имели нормального player с pause/progress/seek.

**Решение:** Создан компонент `AudioPlayer` с:
- Play/Pause
- Прогресс воспроизведения
- Seek (перемотка)
- Визуализация waveform
- Отображение currentTime / duration

---

## ⚠️ Известные ограничения (требуют backend)

### 1. Blob URLs для медиафайлов
**Проблема:** Фото, видео, файлы и голосовые сообщения используют `URL.createObjectURL()`, который создаёт blob URL вида `blob:https://site.com/...`. Эти URL существуют только в текущей сессии браузера. После F5 они становятся невалидными.

**Решение для production:**
- Реализовать backend для загрузки файлов
- Использовать файловое хранилище (S3, MinIO, локальная файловая система)
- Возвращать постоянные URL из backend
- Добавить генерацию thumbnail для видео

### 2. "Удалить у себя" vs "Удалить у всех"
**Проблема:** Сейчас "Удалить у себя" физически удаляет сообщение из общего localStorage. Если в одном браузере войти под другим пользователем, сообщение тоже исчезнет.

**Решение для production:**
```typescript
// Нужна отдельная таблица MessageDeletion
MessageDeletion {
  messageId: string
  userId: string
  deletedAt: timestamp
}

// При "удалить у себя" - добавлять запись в MessageDeletion
// При "удалить у всех" - помечать сообщение как deleted
```

### 3. Read/Delivered статусы - симуляция
**Проблема:** Статусы сообщений симулируются через setTimeout:
- sent → сразу
- delivered → через 500ms
- read → через автоответ

**Решение для production:**
- sent = backend сохранил сообщение в БД
- delivered = WebSocket доставил клиенту получателя
- read = получатель открыл чат и увидел сообщение

### 4. Online/Offline статус - симуляция
**Проблема:** Alice и Bob всегда считаются online. Новые пользователи не становятся online для остальных.

**Решение для production:**
- Использовать WebSocket для отслеживания подключений
- Redis для хранения presence информации
- Heartbeat механизм для определения offline

### 5. Typing indicator - симуляция
**Проблема:** Typing запускается только искусственным автоответчиком. Реальный ввод текста не отправляет typing events.

**Решение для production:**
```typescript
// При вводе текста
input → websocket.emit('typing:start')

// Debounce 1-2 sec
setTimeout(() => websocket.emit('typing:stop'), 2000)
```

### 6. Пересылка сообщений не реализована
**Проблема:** Кнопка "Переслать" есть, но функциональности нет.

**Решение для production:**
- Создать модальное окно выбора диалога
- Копировать сообщение с указанием forwardedFrom
- Показывать "Переслано от @username"

### 7. Кнопки звонков не работают
**Проблема:** Иконки телефона и видеозвонка отображаются, но ничего не делают.

**Решение:**
- Временное: убрать кнопки или добавить tooltip "Скоро"
- Production: WebRTC для голосовых и видеозвонков

### 8. Изменение аватара не работает
**Проблема:** Кнопка камеры в настройках профиля есть, но обработчика загрузки нет.

**Решение для production:**
- File input для загрузки изображения
- Crop/resize на frontend
- Upload на backend
- Сохранение в файловое хранилище

### 9. Уведомления браузера не реализованы
**Проблема:** Настройка "Уведомления" есть, но реальных уведомлений нет.

**Решение для production:**
```typescript
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    new Notification('Новое сообщение', {
      body: message.text,
      icon: user.avatar
    });
  }
});
```

### 10. Звук сообщений не реализован
**Проблема:** Настройка "Звук сообщений" есть, но звук не воспроизводится.

**Решение для production:**
- Добавить аудиофайл notification.mp3
- Воспроизводить при получении нового сообщения
- Учитывать настройку soundEnabled

---

## 🎯 Что нужно для production-ready мессенджера

### Backend (обязательно)
1. **Node.js + Express/NestJS**
   - REST API для авторизации, пользователей, сообщений
   - WebSocket сервер для realtime

2. **PostgreSQL**
   - Users, Conversations, Messages, Attachments
   - MessageDeletion для "удалить у себя"
   - MessageRead для отслеживания прочитанных

3. **Redis**
   - Presence (online/offline)
   - Typing indicators
   - Кэширование сессий

4. **Файловое хранилище**
   - S3 / MinIO / локальная файловая система
   - Генерация thumbnail для изображений и видео

5. **Безопасность**
   - JWT токены (access + refresh)
   - Rate limiting
   - Валидация всех входных данных
   - Защита от XSS, CSRF, SQL injection

### Frontend улучшения
1. **Realtime**
   - Socket.IO клиент
   - Обработка reconnect
   - Синхронизация состояния

2. **UX**
   - Infinite scroll для старых сообщений
   - Optimistic UI updates
   - Drag & drop файлов
   - Paste изображений из clipboard

3. **PWA**
   - Service Worker для offline режима
   - Push notifications
   - Install prompt

4. **Оптимизация**
   - Lazy loading изображений
   - Виртуализация списка сообщений
   - Code splitting
   - Image optimization

---

## 📊 Текущий статус

### ✅ Работает в демо-версии:
- Регистрация и авторизация (localStorage)
- Личные сообщения (текст, emoji)
- Поиск пользователей
- Список диалогов с сортировкой
- "Сохранённые сообщения"
- Контекстное меню (ответ, редактирование, удаление)
- Reply с подсветкой
- Редактирование сообщений
- Удаление сообщений
- Unread counter
- Тёмная/светлая тема
- Настройки профиля
- Смена пароля с проверкой
- Копирование сообщений
- Audio player с pause/progress/seek
- Просмотр медиа из чата
- Responsive дизайн

### ⚠️ Ограничения демо-версии:
- Нет настоящего realtime (только симуляция)
- Медиафайлы ломаются после F5 (blob URLs)
- Нет настоящего online/offline статуса
- Нет typing indicator от реального ввода
- Нет пересылки сообщений
- Нет звонков
- Нет загрузки аватара
- Нет браузерных уведомлений
- Нет звука сообщений

### 🚀 Для production нужно:
- Backend (Node.js + PostgreSQL + Redis)
- WebSocket для realtime
- Файловое хранилище
- Настоящая авторизация (JWT)
- WebRTC для звонков (опционально)

---

## 🔧 Технические детали

### Архитектура хранения данных (demo)
```
localStorage:
├── chatflow_users - массив пользователей
├── chatflow_passwords - хеши паролей (base64)
├── chatflow_conversations - массив диалогов
├── chatflow_messages - массив сообщений
├── chatflow_current_user - текущий пользователь
├── chatflow_theme - тема (light/dark)
└── chatflow_settings - настройки (звук, уведомления)
```

### Структура данных
```typescript
User {
  id, name, username, email, avatar?, bio?,
  online, lastSeen, createdAt
}

Conversation {
  id, type: 'direct', members: [userId1, userId2],
  lastMessage?, unreadCount, createdAt
}

Message {
  id, conversationId, senderId,
  type: 'text' | 'image' | 'video' | 'audio' | 'file',
  text?, attachment?, replyToId?,
  status: 'sending' | 'sent' | 'delivered' | 'read',
  createdAt, updatedAt?, deletedAt?,
  readBy: [userId]
}

Attachment {
  id, fileName, originalName, mimeType, size,
  url (blob URL в demo), duration?, width?, height?
}
```

---

## 📝 Заключение

Текущая версия ChatFlow - это **функциональный прототип** с полноценным UI/UX, но без backend. Все критические баги исправлены, UX улучшен, но для реального использования между разными пользователями/устройствами необходим backend.

**Для production-ready мессенджера нужно:**
1. Реализовать backend (Node.js + PostgreSQL + Redis)
2. Добавить WebSocket для realtime
3. Настроить файловое хранилище
4. Реализовать настоящую авторизацию
5. Добавить WebRTC для звонков (опционально)

**Текущая версия подходит для:**
- Демонстрации UI/UX
- Тестирования пользовательских сценариев
- Прототипирования новых функций
- Обучения React/TypeScript

**Не подходит для:**
- Реального общения между пользователями
- Production использования
- Мобильных приложений (требует backend API)

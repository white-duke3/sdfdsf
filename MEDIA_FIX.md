# Исправление отправки медиа файлов

## Проблема
При отправке медиа файлов (изображений, видео) вместо медиа отправлялось пустое сообщение.

## Причина
В функции `sendMessage` в `src/context/AppContext.tsx` при создании объекта Message не передавалось поле `attachments` (множественные вложения для коллажей).

### Было:
```typescript
const message: Message = {
  id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  conversationId,
  senderId: state.currentUser.id,
  type: messageData.type || 'text',
  text: messageData.text,
  replyToId: messageData.replyToId,
  attachment: messageData.attachment,
  // ❌ Отсутствует attachments
  status: isSaved ? 'read' : 'sent',
  createdAt: new Date().toISOString(),
  readBy: [state.currentUser.id],
};
```

### Стало:
```typescript
const message: Message = {
  id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  conversationId,
  senderId: state.currentUser.id,
  type: messageData.type || 'text',
  text: messageData.text,
  replyToId: messageData.replyToId,
  attachment: messageData.attachment,
  attachments: messageData.attachments, // ✅ Добавлено
  status: isSaved ? 'read' : 'sent',
  createdAt: new Date().toISOString(),
  readBy: [state.currentUser.id],
};
```

## Что было исправлено

### 1. Добавлена поддержка множественных вложений
В `src/context/AppContext.tsx` добавлена передача поля `attachments` при создании сообщения.

### 2. Улучшена обработка файлов в FileDropZone
В `src/components/FileDropZone.tsx` улучшена обработка множественных файлов при drag & drop.

## Как работает отправка файлов

### Одиночный файл
1. Пользователь нажимает на кнопку скрепки 📎
2. Открывается диалог выбора файла
3. Вызывается `handleMultipleFilesSend([file])`
4. Если файл один, создаётся сообщение с `attachment`
5. Сообщение отправляется через `sendMessage`
6. В MessageBubble отображается медиа через проверку `message.type === 'image' && message.attachment`

### Множественные файлы (до 9)
1. Пользователь выбирает несколько файлов
2. Вызывается `handleMultipleFilesSend(files)`
3. Файлы разбиваются на группы по 9
4. Для каждой группы создаётся сообщение с `attachments` (массив)
5. В MessageBubble отображается коллаж через `MediaCollage`

### Drag & Drop
1. Пользователь перетаскивает файл в чат
2. FileDropZone показывает preview
3. При подтверждении вызывается `handleFileSend(file)`
4. Сообщение отправляется с `attachment`

## Проверка отображения медиа

В `src/components/MessageBubble.tsx` есть три условия для отображения медиа:

### 1. Коллаж из нескольких медиа
```typescript
{message.attachments && message.attachments.length > 0 && (
  <MediaCollage
    attachments={message.attachments}
    isOwn={isOwn}
    onImageClick={onImageClick}
  />
)}
```

### 2. Одиночное изображение
```typescript
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
```

### 3. Одиночное видео
```typescript
{message.type === 'video' && message.attachment && !message.attachments && (
  <div className="mb-1 -mx-1">
    <VideoPlayer
      url={message.attachment.url}
      isOwn={isOwn}
    />
  </div>
)}
```

## Важные моменты

### Blob URLs
Медиа файлы используют `URL.createObjectURL(file)`, который создаёт blob URL вида `blob:http://localhost:5173/...`. Эти URL:
- ✅ Работают в текущей сессии браузера
- ❌ Не сохраняются после перезагрузки страницы (F5)
- ❌ Не работают между разными браузерами/устройствами

Для production необходимо:
- Загружать файлы на backend
- Сохранять в файловое хранилище (S3, MinIO)
- Возвращать постоянные URL

### Проверка типов файлов
```typescript
let type: 'image' | 'video' | 'file' = 'file';
if (file.type.startsWith('image/')) type = 'image';
else if (file.type.startsWith('video/')) type = 'video';
```

### Ограничение размера
```typescript
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
if (file.size > MAX_SIZE) {
  addToast('Файл слишком большой (макс. 50 МБ)', 'error');
  return;
}
```

## Тестирование

### Тест 1: Отправка одного изображения
1. Нажмите на кнопку скрепки 📎
2. Выберите изображение
3. Должно отобразиться изображение в чате
4. Клик по изображению открывает полноэкранный просмотр

### Тест 2: Отправка одного видео
1. Нажмите на кнопку скрепки 📎
2. Выберите видео
3. Должен отобразиться кастомный видео плеер
4. Нажмите play для воспроизведения

### Тест 3: Отправка нескольких изображений
1. Нажмите на кнопку скрепки 📎
2. Выберите 2-9 изображений
3. Должен отобразиться коллаж
4. Первое изображение большое, остальные меньше

### Тест 4: Отправка больше 9 файлов
1. Выберите 10+ файлов
2. Должно создаться 2 сообщения:
   - Первое с 9 файлами (коллаж)
   - Второе с оставшимися файлами

### Тест 5: Drag & Drop
1. Перетащите файл в окно чата
2. Должен появиться preview
3. Нажмите "Отправить"
4. Файл должен отобразиться в чате

## Результат
✅ Одиночные файлы отображаются корректно
✅ Множественные файлы отображаются как коллаж
✅ Видео воспроизводится в кастомном плеере
✅ Изображения открываются в полноэкранном просмотрщике
✅ Drag & Drop работает корректно

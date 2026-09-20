// Утилиты для уведомлений и звуков

// Запрос разрешения на уведомления
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Браузер не поддерживает уведомления');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Показ уведомления
export const showNotification = (title: string, body: string, icon?: string) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  // Не показываем уведомление если вкладка активна
  if (!document.hidden) {
    return;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'chat-message', // Группируем уведомления
    });

    // Закрываем уведомление через 5 секунд
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Клик по уведомлению открывает вкладку
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (error) {
    console.error('Ошибка показа уведомления:', error);
  }
};

// Воспроизведение звука уведомления
let audioContext: AudioContext | null = null;

export const playNotificationSound = () => {
  try {
    // Создаем AudioContext если его нет
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Создаем короткий звуковой сигнал
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Настройки звука
    oscillator.frequency.value = 800; // Частота
    oscillator.type = 'sine'; // Тип волны

    // Плавное затухание
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    // Воспроизводим
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.error('Ошибка воспроизведения звука:', error);
  }
};

// Проверка поддержки MediaRecorder
export const isMediaRecorderSupported = (): boolean => {
  return 'MediaRecorder' in window && !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;
};

// Получение поддерживаемого MIME типа для аудио
export const getSupportedAudioMimeType = (): string => {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg',
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return 'audio/webm'; // fallback
};

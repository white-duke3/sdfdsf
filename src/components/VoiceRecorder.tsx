import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, X, Send, Pause, Play } from 'lucide-react';

interface Props {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onSend, onCancel }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isPreview, setIsPreview] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setIsPreview(true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);
    } catch {
      setError('Не удалось получить доступ к микрофону');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, duration);
    }
  };

  const handleCancel = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    onCancel();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Auto-start recording on mount
  useEffect(() => {
    startRecording();
  }, [startRecording]);

  if (error) {
    return (
      <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        <p className="text-sm flex-1" style={{ color: 'var(--color-danger)' }}>{error}</p>
        <button onClick={handleCancel} className="p-2 rounded-lg" style={{ color: 'var(--color-text-secondary)' }}>
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
      {isRecording && (
        <div className="flex items-center gap-2 flex-1">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-danger)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            Запись {formatDuration(duration)}
          </span>
          {/* Waveform visualization */}
          <div className="flex items-center gap-0.5 ml-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full transition-all"
                style={{
                  height: `${8 + Math.random() * 16}px`,
                  backgroundColor: 'var(--color-primary)',
                  opacity: 0.3 + Math.random() * 0.7,
                  animation: `pulse ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {isPreview && audioUrl && (
        <div className="flex items-center gap-3 flex-1">
          <audio src={audioUrl} controls className="max-w-[200px] h-8" />
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {formatDuration(duration)}
          </span>
        </div>
      )}

      <div className="flex items-center gap-1">
        {isRecording && (
          <button
            onClick={stopRecording}
            className="p-2.5 rounded-full transition-all-fast hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)' }}
            title="Остановить"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        )}
        {isPreview && (
          <button
            onClick={handleSend}
            className="p-2.5 rounded-full transition-all-fast hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)' }}
            title="Отправить"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        )}
        <button
          onClick={handleCancel}
          className="p-2.5 rounded-full transition-all-fast hover:opacity-70"
          style={{ color: 'var(--color-text-secondary)' }}
          title="Отмена"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

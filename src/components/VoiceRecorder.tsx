import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Trash2, Pause, Play } from 'lucide-react';

interface Props {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onSend, onCancel }: Props) {
  const [isRecording, setIsRecording] = useState(true);
  const [duration, setDuration] = useState(0);
  const [isPreview, setIsPreview] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const finalDurationRef = useRef<number>(0); // Точная длительность в секундах
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const visualizeAudio = useCallback(() => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateWaveform = () => {
      analyserRef.current!.getByteFrequencyData(dataArray);
      
      // Get average of lower frequencies (voice range)
      const voiceRange = Math.floor(bufferLength * 0.3);
      let sum = 0;
      for (let i = 0; i < voiceRange; i++) {
        sum += dataArray[i];
      }
      const average = sum / voiceRange;
      const normalized = Math.min(average / 128, 1);
      
      setWaveformData(prev => {
        const newData = [...prev, normalized];
        if (newData.length > 40) newData.shift();
        return newData;
      });
      
      animationRef.current = requestAnimationFrame(updateWaveform);
    };
    
    updateWaveform();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio context for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
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
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      startTimeRef.current = Date.now();
      
      // Start visualization
      visualizeAudio();
      
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setDuration(Math.floor(elapsed));
      }, 100);
    } catch {
      setError('Не удалось получить доступ к микрофону');
    }
  }, [visualizeAudio]);

  const stopRecording = useCallback(() => {
    // Сохраняем точную длительность перед остановкой
    if (startTimeRef.current > 0) {
      finalDurationRef.current = (Date.now() - startTimeRef.current) / 1000;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const handleSend = () => {
    if (audioBlob) {
      // Используем точное значение duration из ref
      const finalDuration = finalDurationRef.current > 0 ? finalDurationRef.current : duration;
      onSend(audioBlob, finalDuration);
    }
  };

  const handleCancel = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    onCancel();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [audioUrl]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    startRecording();
  }, [startRecording]);

  if (error) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 animate-fade-in" style={{ backgroundColor: 'var(--color-surface)' }}>
        <p className="text-sm flex-1" style={{ color: 'var(--color-danger)' }}>{error}</p>
        <button onClick={handleCancel} className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-secondary)' }}>
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-fade-in" style={{ backgroundColor: 'var(--color-surface)' }}>
      {isRecording && (
        <>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: 'var(--color-danger)' }} />
            <span className="text-sm font-medium flex-shrink-0" style={{ color: 'var(--color-text)' }}>
              {formatDuration(duration)}
            </span>
            {/* Waveform visualization */}
            <div className="flex items-center gap-0.5 flex-1 h-8 ml-2">
              {waveformData.map((value, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(4, value * 32)}px`,
                    backgroundColor: 'var(--color-primary)',
                    opacity: 0.4 + value * 0.6,
                  }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2.5 rounded-full transition-all-fast hover:opacity-70 flex-shrink-0"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-danger)' }}
            title="Отменить"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={stopRecording}
            className="p-2.5 rounded-full transition-all-fast hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: 'var(--color-primary)' }}
            title="Отправить"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </>
      )}

      {isPreview && audioUrl && (
        <>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-primary)' }}>
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-0.5 h-8">
                {Array.from({ length: 30 }).map((_, i) => {
                  const height = 8 + Math.sin(i * 0.5) * 12 + Math.random() * 8;
                  return (
                    <div
                      key={i}
                      className="w-1 rounded-full"
                      style={{
                        height: `${height}px`,
                        backgroundColor: 'var(--color-primary)',
                        opacity: 0.5,
                      }}
                    />
                  );
                })}
              </div>
              <span className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {formatDuration(duration)}
              </span>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2.5 rounded-full transition-all-fast hover:opacity-70 flex-shrink-0"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-danger)' }}
            title="Удалить"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleSend}
            className="p-2.5 rounded-full transition-all-fast hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: 'var(--color-primary)' }}
            title="Отправить"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </>
      )}
    </div>
  );
}

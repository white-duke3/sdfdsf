import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface Props {
  url: string;
  duration?: number;
  isOwn: boolean;
}

export default function AudioPlayer({ url, duration, isOwn }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Используем duration из props, если передан, иначе пытаемся получить из audio
  const [audioDuration, setAudioDuration] = useState<number>(() => {
    if (duration && duration > 0 && isFinite(duration)) {
      return duration;
    }
    return 0;
  });

  useEffect(() => {
    const audio = new Audio(url);
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      // Если duration не передан из props или невалиден, используем из audio
      if (!duration || duration <= 0 || !isFinite(duration)) {
        const audioDur = audio.duration;
        // Проверяем на Infinity и NaN (часто бывает с blob URL)
        if (isFinite(audioDur) && audioDur > 0) {
          setAudioDuration(audioDur);
        }
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };

    const handleError = () => {
      console.error('Audio playback error');
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Пытаемся загрузить метаданные
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [url, duration]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    if (isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) {
      return '0:00';
    }
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;
  const displayDuration = audioDuration > 0 ? audioDuration : (duration || 0);

  return (
    <div className="flex items-center gap-3 py-1 min-w-[220px]">
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all-fast hover:opacity-80 hover:scale-105"
        style={{ backgroundColor: isOwn ? 'rgba(255,255,255,0.2)' : 'var(--color-primary)' }}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" fill="white" stroke="white" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" fill="white" stroke="white" />
        )}
      </button>
      
      <div className="flex-1">
        <div className="relative h-8 flex items-center">
          {/* Waveform visualization */}
          <div className="absolute inset-0 flex items-center gap-0.5">
            {Array.from({ length: 30 }).map((_, i) => {
              const seed = i * 7;
              const height = 6 + Math.sin(i * 0.4 + seed * 0.1) * 10 + Math.cos(i * 0.7) * 4;
              const barProgress = (i / 30) * 100;
              const isPlayed = barProgress <= progress;
              
              return (
                <div
                  key={i}
                  className="w-0.5 rounded-full transition-all"
                  style={{
                    height: `${Math.max(4, height)}px`,
                    backgroundColor: isOwn
                      ? isPlayed ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)'
                      : isPlayed ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    opacity: 0.6 + Math.sin(i * 0.3) * 0.3,
                  }}
                />
              );
            })}
          </div>
          
          {/* Seek slider */}
          <input
            type="range"
            min="0"
            max={displayDuration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ zIndex: 10 }}
          />
        </div>
        
        <span className="text-[10px] mt-0.5" style={{ color: isOwn ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }}>
          {formatTime(currentTime)} / {formatTime(displayDuration)}
        </span>
      </div>
    </div>
  );
}

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
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

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
            max={audioDuration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ zIndex: 10 }}
          />
        </div>
        
        <span className="text-[10px] mt-0.5" style={{ color: isOwn ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }}>
          {formatTime(currentTime)} / {formatTime(audioDuration)}
        </span>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Maximize2 } from 'lucide-react';

interface Props {
  url: string;
  isOwn: boolean;
}

export default function VideoPlayer({ url, isOwn }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [url]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    if (isFinite(time)) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) {
      return '0:00';
    }
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className="relative rounded-xl overflow-hidden bg-black"
      style={{ maxWidth: '320px', maxHeight: '320px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* Play button overlay */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/90 hover:bg-white transition-colors">
            <Play className="w-8 h-8 ml-1" fill="var(--color-primary)" stroke="var(--color-primary)" />
          </div>
        </div>
      )}

      {/* Controls overlay */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          {/* Progress bar */}
          <div className="relative h-1 bg-white/30 rounded-full mb-2 cursor-pointer">
            <div 
              className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="hover:opacity-80 transition-opacity"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" fill="white" stroke="white" />
                ) : (
                  <Play className="w-4 h-4" fill="white" stroke="white" />
                )}
              </button>
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            <button
              onClick={handleFullscreen}
              className="hover:opacity-80 transition-opacity"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

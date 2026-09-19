import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, File, Image, Film } from 'lucide-react';

interface Props {
  onSend: (file: File) => void;
  children: React.ReactNode;
}

export default function FileDropZone({ onSend, children }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setPreviewFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  }, []);

  // Handle paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const file = blob as unknown as File;
            setPreviewFile(file);
            setPreviewUrl(URL.createObjectURL(blob));
            e.preventDefault();
            break;
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const handleSendPreview = () => {
    if (previewFile) {
      onSend(previewFile);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewFile(null);
      setPreviewUrl(null);
    }
  };

  const handleCancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (file.type.startsWith('video/')) return <Film className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className="relative h-full"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}

      {/* Drag overlay */}
      {isDragging && (
        <div className="drop-zone">
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-primary)' }} />
            <p className="text-lg font-medium" style={{ color: 'var(--color-primary)' }}>
              Перетащите файл сюда
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Изображения, видео, документы
            </p>
          </div>
        </div>
      )}

      {/* File preview modal */}
      {previewFile && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>Отправить файл</p>
              <button onClick={handleCancelPreview} className="p-1" style={{ color: 'var(--color-text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              {previewUrl && previewFile.type.startsWith('image/') ? (
                <img src={previewUrl} alt="Preview" className="w-full max-h-[300px] object-contain rounded-lg" />
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
                    <span className="text-white">{getFileIcon(previewFile)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{previewFile.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatSize(previewFile.size)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 px-4 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
              <button
                onClick={handleCancelPreview}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all-fast"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)' }}
              >
                Отмена
              </button>
              <button
                onClick={handleSendPreview}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all-fast hover:opacity-90"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

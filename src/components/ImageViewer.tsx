import React from 'react';
import { X, Download } from 'lucide-react';

interface Props {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageViewer({ src, alt, onClose }: Props) {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = src;
    a.download = alt;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={handleDownload}
          className="p-3 rounded-full transition-all-fast hover:opacity-80"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <Download className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={onClose}
          className="p-3 rounded-full transition-all-fast hover:opacity-80"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
      <img
        src={src}
        alt={alt}
        className="max-w-[90vw] max-h-[90vh] object-contain animate-fade-in"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

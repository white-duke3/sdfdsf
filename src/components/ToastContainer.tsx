import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export default function ToastContainer() {
  const { state } = useApp();

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {state.toasts.map(toast => (
        <div
          key={toast.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-fade-in min-w-[280px] max-w-[400px]"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-success)' }} />}
          {toast.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-danger)' }} />}
          {toast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />}
          <p className="text-sm" style={{ color: 'var(--color-text)' }}>{toast.message}</p>
        </div>
      ))}
    </div>
  );
}

'use client';

import React, { createContext, useContext, useState, useCallback, useId } from 'react';
import { cn } from '@/utils/cn';

export interface ToastMessage {
  id: string;
  title?: string;
  description: string;
  type?: 'default' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface ToastContextType {
  toast: (description: string, options?: Omit<ToastMessage, 'id' | 'description'>) => void;
  toasts: ToastMessage[];
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (description: string, options?: Omit<ToastMessage, 'id' | 'description'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = {
        id,
        description,
        type: options?.type || 'default',
        title: options?.title,
        duration: options?.duration || 4000,
      };

      setToasts((prev) => [...prev, newToast]);

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, newToast.duration);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, toasts, dismiss }}>
      {children}
      {/* Toast Portal/Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            className={cn(
              'pointer-events-auto flex flex-col gap-1 rounded-lg border p-4 shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0 cursor-pointer animate-in fade-in slide-in-from-bottom-2',
              t.type === 'default' && 'bg-bg-card border-border-muted text-text-primary',
              t.type === 'success' && 'bg-bg-card border-accent-emerald/30 text-accent-emerald',
              t.type === 'warning' && 'bg-bg-card border-accent-amber/30 text-accent-amber',
              t.type === 'error' && 'bg-bg-card border-accent-rose/30 text-accent-rose'
            )}
          >
            {t.title && <h5 className="font-semibold text-sm leading-none">{t.title}</h5>}
            <p className="text-xs text-text-secondary">{t.description}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

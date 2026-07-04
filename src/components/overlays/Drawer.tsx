'use client';

import React, { useEffect } from 'react';
import { Button } from '../ui/Button';
import { cn } from '@/utils/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  side?: 'right' | 'bottom';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute bg-bg-secondary border p-6 shadow-xl flex flex-col gap-4 transition-transform duration-300 pointer-events-auto",
          side === 'right' && "top-0 right-0 h-full w-full max-w-sm border-l border-border-muted animate-in slide-in-from-right",
          side === 'bottom' && "bottom-0 left-0 w-full h-auto max-h-[80vh] border-t border-border-muted rounded-t-lg animate-in slide-in-from-bottom"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-muted pb-3">
          <h2 className="text-lg font-semibold tracking-tight text-text-primary">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 flex items-center justify-center text-text-muted hover:text-text-primary rounded-full"
            aria-label="Close panel"
          >
            &times;
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto text-sm text-text-secondary leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;

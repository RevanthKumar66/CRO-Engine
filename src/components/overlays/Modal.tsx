'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { cn } from '@/utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-lg rounded-lg bg-bg-secondary border border-border-muted p-6 shadow-xl flex flex-col gap-4 animate-in zoom-in-95 duration-200 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-muted pb-3">
          <h2 id="modal-title" className="text-lg font-semibold tracking-tight text-text-primary">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 flex items-center justify-center text-text-muted hover:text-text-primary rounded-full"
            aria-label="Close dialog"
          >
            &times;
          </Button>
        </div>
        <div className="text-sm text-text-secondary leading-relaxed max-h-[60vh] overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-border-muted pt-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

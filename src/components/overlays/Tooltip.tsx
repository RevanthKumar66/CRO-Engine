'use client';

import React, { useState } from 'react';
import { cn } from '@/utils/cn';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block cursor-help"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 px-2 py-1 text-xs font-medium text-text-primary bg-zinc-900 border border-border-muted rounded shadow-md whitespace-nowrap pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95",
            position === 'top' && "bottom-full left-1/2 -translate-x-1/2 mb-2",
            position === 'bottom' && "top-full left-1/2 -translate-x-1/2 mt-2",
            position === 'left' && "right-full top-1/2 -translate-y-1/2 mr-2",
            position === 'right' && "left-full top-1/2 -translate-y-1/2 ml-2"
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;

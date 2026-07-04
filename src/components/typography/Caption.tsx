import React from 'react';
import { cn } from '@/utils/cn';

export interface CaptionProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const Caption: React.FC<CaptionProps> = ({ className, ...props }) => {
  return (
    <span
      className={cn(
        'font-sans text-xs font-normal tracking-wide text-text-muted leading-tight',
        className
      )}
      {...props}
    />
  );
};

export default Caption;

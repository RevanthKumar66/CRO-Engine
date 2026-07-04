import React from 'react';
import { cn } from '@/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error = false, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-border-muted bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-violet focus-visible:border-accent-violet disabled:cursor-not-allowed disabled:opacity-50',
          error &&
            'border-accent-rose focus-visible:ring-accent-rose focus-visible:border-accent-rose',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;

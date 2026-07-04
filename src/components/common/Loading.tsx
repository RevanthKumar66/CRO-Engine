import React from 'react';
import { cn } from '@/utils/cn';

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading analysis data...',
  className,
  ...props
}) => {
  return (
    <div
      className={cn('flex min-h-[400px] flex-col items-center justify-center gap-4 p-6', className)}
      {...props}
    >
      <div className="relative h-10 w-10">
        <div className="absolute h-full w-full rounded-full border-2 border-border-muted"></div>
        <div className="absolute h-full w-full animate-spin rounded-full border-2 border-accent-violet border-t-transparent"></div>
      </div>
      <p className="animate-pulse text-sm text-text-secondary">{message}</p>
    </div>
  );
};

export default Loading;

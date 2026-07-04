import React from 'react';
import { cn } from '@/utils/cn';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
}

export const Progress: React.FC<ProgressProps> = ({
  className,
  value = 0,
  max = 100,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-zinc-800', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-accent-violet transition-all duration-300 ease-in-out"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
};

export default Progress;

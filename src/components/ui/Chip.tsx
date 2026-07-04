import React from 'react';
import { cn } from '@/utils/cn';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  pill?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  className,
  active = false,
  pill = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center text-xs font-medium border border-border-muted px-2.5 py-0.5 select-none transition-colors',
        pill ? 'rounded-full' : 'rounded-md',
        active
          ? 'bg-accent-violet-glow border-accent-violet text-accent-violet'
          : 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:border-border-accent',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Chip;
export { Chip as Pill };

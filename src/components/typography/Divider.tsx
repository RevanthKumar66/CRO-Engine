import React from 'react';
import { cn } from '@/utils/cn';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

export const Divider: React.FC<DividerProps> = ({
  className,
  orientation = 'horizontal',
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-border-muted shrink-0",
        orientation === 'horizontal' ? "h-[1px] w-full my-4" : "h-full w-[1px] mx-4",
        className
      )}
      {...props}
    />
  );
};

export default Divider;

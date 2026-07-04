import React from 'react';
import { cn } from '@/utils/cn';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'between' | 'end';
  gap?: 0 | 1 | 2 | 3 | 4 | 6 | 8;
  wrap?: boolean;
}

export const Stack: React.FC<StackProps> = ({
  className,
  direction = 'col',
  align = 'stretch',
  justify = 'start',
  gap = 4,
  wrap = false,
  ...props
}) => {
  const gapClasses = {
    0: "gap-0",
    1: "gap-1",
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    between: "justify-between",
    end: "justify-end",
  };

  return (
    <div
      className={cn(
        "flex",
        direction === 'col' ? "flex-col" : "flex-row",
        alignClasses[align],
        justifyClasses[justify],
        gapClasses[gap],
        wrap && "flex-wrap",
        className
      )}
      {...props}
    />
  );
};

export default Stack;

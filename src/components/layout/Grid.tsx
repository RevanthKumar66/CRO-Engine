import React from 'react';
import { cn } from '@/utils/cn';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 12;
  colsSm?: 1 | 2 | 3 | 4;
  colsMd?: 1 | 2 | 3 | 4 | 6;
  colsLg?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 2 | 4 | 6 | 8;
}

export const Grid: React.FC<GridProps> = ({
  className,
  cols = 1,
  colsSm,
  colsMd,
  colsLg,
  gap = 6,
  ...props
}) => {
  const gapClasses = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    12: 'grid-cols-12',
  };

  const colsSmClasses = {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
  };

  const colsMdClasses = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    6: 'md:grid-cols-6',
  };

  const colsLgClasses = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    6: 'lg:grid-cols-6',
    12: 'lg:grid-cols-12',
  };

  return (
    <div
      className={cn(
        'grid',
        colsClasses[cols],
        colsSm && colsSmClasses[colsSm],
        colsMd && colsMdClasses[colsMd],
        colsLg && colsLgClasses[colsLg],
        gapClasses[gap],
        className
      )}
      {...props}
    />
  );
};

export default Grid;

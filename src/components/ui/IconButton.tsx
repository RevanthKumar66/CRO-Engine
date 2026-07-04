import React from 'react';
import { Button, type ButtonProps } from './Button';
import { cn } from '@/utils/cn';

export interface IconButtonProps extends ButtonProps {
  'aria-label': string; // Enforce accessible labels for icon buttons
}

export const IconButton: React.FC<IconButtonProps> = ({ className, children, ...props }) => {
  return (
    <Button
      variant="secondary"
      size="sm"
      className={cn('h-9 w-9 p-0 flex items-center justify-center rounded-md', className)}
      {...props}
    >
      {children}
    </Button>
  );
};

export default IconButton;

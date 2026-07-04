import React from 'react';
import { Button, type ButtonProps } from './Button';
import { Spinner } from '../feedback/Spinner';
import { cn } from '@/utils/cn';

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  className,
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}) => {
  return (
    <Button
      className={cn("relative gap-2", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" className="text-current" />}
      {loading && loadingText ? <span>{loadingText}</span> : children}
    </Button>
  );
};

export default LoadingButton;

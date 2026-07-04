import React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'glassmorphic-card rounded-lg bg-bg-card p-6 border border-border-muted transition-all duration-200',
        className
      )}
      {...props}
    />
  );
};

export const CardHeader: React.FC<CardProps> = ({ className, ...props }) => {
  return <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props} />;
};

export const CardTitle: React.FC<CardProps> = ({ className, ...props }) => {
  return (
    <h3
      className={cn(
        'text-lg font-semibold leading-none tracking-tight text-text-primary',
        className
      )}
      {...props}
    />
  );
};

export const CardDescription: React.FC<CardProps> = ({ className, ...props }) => {
  return <p className={cn('text-sm text-text-muted', className)} {...props} />;
};

export const CardContent: React.FC<CardProps> = ({ className, ...props }) => {
  return <div className={cn('pt-0', className)} {...props} />;
};

export const CardFooter: React.FC<CardProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn('flex items-center pt-4 border-t border-border-muted mt-4', className)}
      {...props}
    />
  );
};
export default Card;

import React from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { cn } from '@/utils/cn';

export interface EmptyStateCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  className,
  icon,
  title,
  description,
  actionText,
  onAction,
  ...props
}) => {
  return (
    <Card
      className={cn(
        'glassmorphic-card flex flex-col items-center justify-center p-8 md:p-12 text-center border-dashed border-2',
        className
      )}
      {...props}
    >
      <CardContent className="flex flex-col items-center gap-4 max-w-sm p-0">
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-secondary border border-border-muted text-text-muted">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-text-primary tracking-tight">{title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
        {actionText && onAction && (
          <Button onClick={onAction} className="mt-2">
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyStateCard;

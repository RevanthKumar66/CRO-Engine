import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from './Card';
import { cn } from '@/utils/cn';

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: string | number;
    type: 'positive' | 'negative' | 'neutral';
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  className,
  title,
  value,
  description,
  trend,
  ...props
}) => {
  return (
    <Card className={cn('glassmorphic-card p-6', className)} {...props}>
      <CardHeader className="p-0 pb-2">
        <span className="text-sm font-medium text-text-secondary select-none">{title}</span>
      </CardHeader>
      <CardContent className="p-0 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-text-primary">{value}</span>
          {trend && (
            <span
              className={cn(
                'text-xs font-medium',
                trend.type === 'positive' && 'text-accent-emerald',
                trend.type === 'negative' && 'text-accent-rose',
                trend.type === 'neutral' && 'text-text-muted'
              )}
            >
              {trend.type === 'positive' ? '↑' : trend.type === 'negative' ? '↓' : ''} {trend.value}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-text-muted select-none">{description}</p>}
      </CardContent>
    </Card>
  );
};

export default MetricCard;

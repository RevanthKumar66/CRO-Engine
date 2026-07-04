import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from './Card';
import { cn } from '@/utils/cn';

export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  badgeText?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  className,
  icon,
  title,
  description,
  badgeText,
  ...props
}) => {
  return (
    <Card className={cn("glassmorphic-card transition-all duration-200 hover:border-accent-violet/30", className)} {...props}>
      <CardHeader className="flex flex-row items-center gap-3 p-0 pb-3">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-secondary border border-border-muted text-accent-violet">
            {icon}
          </div>
        )}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            {badgeText && (
              <span className="rounded-full bg-accent-violet-glow px-2 py-0.5 text-xs text-accent-violet font-medium">
                {badgeText}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-sm text-text-secondary leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;

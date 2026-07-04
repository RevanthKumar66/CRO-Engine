import React from 'react';
import { cn } from '@/utils/cn';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div';
}

export const Section: React.FC<SectionProps> = ({
  className,
  as: Component = 'section',
  ...props
}) => {
  return (
    <Component
      className={cn(
        'py-8 md:py-12 lg:py-16 border-b border-border-muted/30 last:border-b-0',
        className
      )}
      {...props}
    />
  );
};

export default Section;

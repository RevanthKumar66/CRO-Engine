import React from 'react';
import { cn } from '@/utils/cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'font-sans text-sm font-medium leading-none text-text-secondary select-none cursor-pointer',
          className
        )}
        {...props}
      />
    );
  }
);

Label.displayName = 'Label';

export default Label;

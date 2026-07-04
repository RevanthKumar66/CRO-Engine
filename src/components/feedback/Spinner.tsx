import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const spinnerVariants = cva('animate-spin rounded-full border-t-transparent', {
  variants: {
    variant: {
      primary: 'border-accent-violet',
      secondary: 'border-text-secondary',
      current: 'border-current',
    },
    size: {
      sm: 'h-4 w-4 border-2',
      default: 'h-6 w-6 border-2',
      lg: 'h-10 w-10 border-3',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'default',
  },
});

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof spinnerVariants> {}

export const Spinner: React.FC<SpinnerProps> = ({ className, variant, size, ...props }) => {
  return (
    <div
      className={cn(spinnerVariants({ variant, size, className }))}
      role="status"
      aria-label="loading"
      {...props}
    />
  );
};

export default Spinner;

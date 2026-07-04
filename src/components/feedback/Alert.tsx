import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const alertVariants = cva('relative w-full rounded-lg border p-4 flex gap-3 text-sm', {
  variants: {
    variant: {
      default: 'bg-bg-secondary text-text-primary border-border-muted',
      success: 'bg-accent-emerald/5 text-accent-emerald border-accent-emerald/20',
      warning: 'bg-accent-amber/5 text-accent-amber border-accent-amber/20',
      destructive: 'bg-accent-rose/5 text-accent-rose border-accent-rose/20',
      info: 'bg-accent-violet-glow text-accent-violet border-accent-violet/20',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
  title?: string;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant,
  icon,
  title,
  children,
  ...props
}) => {
  return (
    <div role="alert" className={cn(alertVariants({ variant, className }))} {...props}>
      {icon && <div className="shrink-0 h-5 w-5 flex items-center justify-center">{icon}</div>}
      <div className="flex flex-col gap-1">
        {title && (
          <h5 className="font-semibold leading-none tracking-tight select-none">{title}</h5>
        )}
        <div className="text-text-secondary leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

export default Alert;
export { alertVariants };
